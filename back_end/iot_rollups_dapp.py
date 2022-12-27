# Copyright 2022 Cartesi Pte. Ltd.
#
# SPDX-License-Identifier: Apache-2.0
# Licensed under the Apache License, Version 2.0 (the "License"); you may not use
# this file except in compliance with the License. You may obtain a copy of the
# License at http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software distributed
# under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
# CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.

from os import environ
import traceback
import logging
import requests

import json
from hashlib import sha256
from Cryptodome.Signature import eddsa

import db_manager as db
import util

DB_FILE = "schedules.db"

logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)

rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
logger.info(f"HTTP rollup_server url is {rollup_server}")


def is_schedule(data):
    if "line_id" not in data:
        return False
    # if "line_name" not in data:
    #     return False
    if "route" not in data:
        return False
    if "stops" not in data:
        return False
    if "schedule" not in data:
        return False

    return True


def handle_advance(data):
    try:
        ### payload to UTF-8
        payload_utf8 = util.hex_to_str(data["payload"])
        # logger.info(f"Payload UTF-8 {payload_utf8}")

        try:
            payload_dict = json.loads(payload_utf8)
        except json.decoder.JSONDecodeError:
            return "reject"

        ### managing database
        conn = db.create_connection(DB_FILE)

        #### is new Schedule
        if is_schedule(payload_dict):
            trip_id = 0
            line_id = payload_dict["line_id"]  # bus line id
            route = payload_dict["route"]
            stops = payload_dict["stops"]
            schedules = payload_dict["schedule"]

            if not db.insert_bus_line(conn, line_id, route):
                conn.close()
                return "reject"

            for schedule in schedules:
                trip_id += 1
                if not db.insert_trip_schedule(conn, trip_id, line_id, schedule):
                    conn.close()
                    return "reject"

            stop_id = 0
            for stop in stops:
                stop_id += 1
                if not db.insert_stop(conn, stop_id, line_id, stop):
                    conn.close()
                    return "reject"

        else:
            # SHA256 hash check
            sha256_digest = (
                sha256(
                    json.dumps(payload_dict["data"], separators=(",", ":")).encode(
                        "utf-8"
                    )
                )
                .hexdigest()
                .upper()
            )
            assert sha256_digest == payload_dict["sha256"]

            # Signature check
            public_key = eddsa.import_public_key(
                bytes.fromhex(payload_dict["public_key"])
            )
            signature = bytes.fromhex(payload_dict["Ed25519"])
            msg = bytes.fromhex(sha256_digest)

            verifier = eddsa.new(public_key, mode="rfc8032")
            verifier.verify(
                msg, signature
            )  # will raise Exception if signature is not authentic

            line_id = payload_dict["data"]["line_id"]
            route = db.select_route_of_line(conn, line_id)

            if route is None:
                conn.close()
                return "reject"

            stops = db.select_stops(conn, line_id)
            for data in payload_dict["data"]["value"]:
                print(data)
                trip_id = data["trip_id"]
                curr_lat = data["lat"]
                curr_lon = data["lon"]
                ts = data["ts"]

                fine_dsc = None

                in_route = util.in_route(curr_lat, curr_lon, route)
                if in_route is not True:
                    fine_dsc = {
                        "ts": ts,
                        "tp": 1,  # type 1: different route
                        "dsc": "Out of route",
                        "distance": round(in_route, 2),
                        "curr_coords": (curr_lat, curr_lon),
                        "bus_line": line_id,
                        "trip": trip_id,
                        "value": round(50 * in_route, 2),  # 50 for each kilometer
                    }
                else:  # is on route -> check schedule
                    # get stop
                    stop_id = util.next_stop(curr_lat, curr_lon, stops)

                    # check schedule
                    if stop_id is not None:  # arrived at next_stop
                        result = db.select_stop_schedule(conn, stop_id, line_id, trip_id)
                        if result is None:  # invalid trip id
                            conn.close()
                            return "reject"

                        stop, stop_time = result
                        late = util.is_late(ts, stop_time)

                        if late:
                            fine_dsc = {
                                "ts": ts,
                                "tp": 2,  # type 2: late, according to Schedule
                                "dsc": "Late, according to Schedule",
                                "curr_stop": stop,
                                "late": str(late),  # how much is late
                                "bus_line": line_id,
                                "trip": trip_id,
                                "value": round(
                                    0.10 * late.seconds, 2
                                ),  # 0.10 cents for each second
                            }

                if fine_dsc:
                    notice_payload = util.str_to_eth_hex(json.dumps(fine_dsc))
                    # logger.info("### Notice Payload ###")
                    # logger.info(notice_payload)
                    # logger.info("### Notice Payload ###")
                    logger.info("Adding notice")
                    response = requests.post(
                        rollup_server + "/notice", json={"payload": notice_payload}
                    )
                    logger.info(
                        f"Received notice status {response.status_code} body {response.content}"
                    )

                prev_bus_id = line_id

        conn.close()
        return "accept"
    except Exception as e:
        logger.info(f"Unexpected Error: {e}\nRejecting...")
        conn.close()
        return "reject"


def handle_inspect(data):
    try:
        ### payload to UTF-8
        payload_utf8 = util.hex_to_str(data["payload"])
        logger.info(f"Inspect Payload UTF-8 {payload_utf8}")

        payload_dict = json.loads(payload_utf8)
        logger.info(f"Payload DICT {payload_dict}")

        def generate_report(msg):
            result = util.str_to_eth_hex(msg)
            logger.info("Adding report")
            response = requests.post(
                rollup_server + "/report", json={"payload": result}
            )
            logger.info(f"Received report status {response.status_code}")

        if "select" not in payload_dict:
            generate_report(
                f"Must have 'select' key! Valid values are: {list(select_options.keys())}"
            )
            return "reject"

        conn = db.create_connection(DB_FILE)
        option = payload_dict["select"]
        select_options = {
            "lines": {"required": False, "function": db.select_lines_id},
            "routes": {"required": True, "function": db.select_route_of_line},
            "trips": {"required": True, "function": db.count_trips},
        }

        if option not in select_options:
            generate_report(
                f"Invalid select option! Valid options are: {list(select_options.keys())}"
            )
            return "reject"

        select_function = select_options[option]["function"]
        if not select_options[option]["required"]:
            result = select_function(conn)
        else:
            if option not in payload_dict:
                generate_report(f"Missing key: {option}")
                return "reject"

            option_value = payload_dict[option]
            if type(option_value) == str:
                result = select_function(conn, option_value)
            elif type(option_value) == list:
                result = {}
                for val in option_value:
                    result[val] = select_function(conn, val)
            else:
                generate_report(f"{option} value must be a list or a string!")
                return "reject"

        generate_report(json.dumps(result))
        return "accept"

    except Exception as e:
        logger.info(f"Unexpected Error: {e}\nRejecting...")
        return "reject"


handlers = {
    "advance_state": handle_advance,
    "inspect_state": handle_inspect,
}

finish = {"status": "accept"}
rollup_address = None

while True:
    logger.info("Sending finish")
    response = requests.post(rollup_server + "/finish", json=finish)
    logger.info(f"Received finish status {response.status_code}")
    if response.status_code == 202:
        logger.info("No pending rollup request, trying again")
    else:
        rollup_request = response.json()
        metadata = rollup_request["data"].get("metadata")
        if metadata and metadata["epoch_index"] == 0 and metadata["input_index"] == 0:
            rollup_address = metadata["msg_sender"]
            logger.info(f"Captured rollup address: {rollup_address}")
        else:
            handler = handlers[rollup_request["request_type"]]
            finish["status"] = handler(rollup_request["data"])
