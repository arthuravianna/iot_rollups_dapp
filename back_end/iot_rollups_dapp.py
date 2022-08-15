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
import db_manager as db
import util

DB_FILE = "schedules.db"

logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)

rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
logger.info(f"HTTP rollup_server url is {rollup_server}")


def handle_advance(data):
    try:
        #logger.info(f"Received advance request data {data}")

        ### payload to UTF-8
        payload_utf8 = util.hex_to_str(data["payload"])
        # logger.info(f"Payload UTF-8 {payload_utf8}")

        ### managing database
        conn = db.create_connection(DB_FILE)

        try:
            payload_dict = json.loads(payload_utf8)
        except json.decoder.JSONDecodeError:
            conn.close()
            return "reject"

        #### is new Schedule
        if "new_schedule" in payload_dict:
            count = 0
            bus_id = payload_dict["bus_id"] # bus line id       
            route = payload_dict["route"]    
            stops = payload_dict["stops"]
            schedules = payload_dict["schedule"]     

            if not db.insert_bus_line(conn, bus_id, route):
                conn.close()
                return "reject"
            
            for schedule in schedules:
                count += 1
                trip_id = f"{bus_id};{count}"
                if not db.insert_trip_schedule(conn, trip_id, bus_id, schedule):
                    conn.close()
                    return "reject"
            
            stop_id = 0
            for stop in stops:
                stop_id += 1
                if not db.insert_stop(conn, stop_id, bus_id, stop):
                    conn.close()
                    return "reject"

        else:
            bus_id = payload_dict["bus_id"]
            trip_id = payload_dict["trip_id"]
            curr_lat = payload_dict["lat"]
            curr_lon = payload_dict["lon"]
            ts = payload_dict["ts"]
            
            # check route
            route = db.select_route_of_line(conn, bus_id)
            if route is None:
                conn.close()
                return "reject"

            fine_dsc = None

            in_route = util.in_route(curr_lat, curr_lon, route)
            if in_route is not True:
                fine_dsc = {
                    "ts": ts,
                    "tp": 1,                                    # type 1: different route
                    "dsc": "Out of route",
                    #"expected_route": route,
                    "distance": round(in_route,2),
                    "curr_coords": (curr_lat, curr_lon),
                    "bus_line": bus_id,
                    "trip": trip_id,
                    "value": round(50 * in_route, 2)           # 50 for each kilometer
                }
            else: # is on route
                # get stop
                stops = db.select_stops(conn, bus_id)
                stop_id = util.next_stop(curr_lat, curr_lon, stops)

                # check schedule
                if stop_id is not None: # arrived at next_stop
                    result = db.select_stop_schedule(conn, stop_id, bus_id, trip_id)
                    if result is None:
                        conn.close()
                        return "reject"
                    
                    stop, stop_time = result
                    late = util.is_late(ts, stop_time)
                
                    if late:
                        fine_dsc = {
                            "ts": ts,
                            "tp": 2,                                # type 2: late, according to Schedule
                            "dsc": "Late, according to Schedule",
                            "curr_stop": stop,
                            "late": str(late),                      # how much is late
                            "bus_line": bus_id,
                            "trip": trip_id,
                            "value": round(0.10 * late.seconds, 2)  # 0.10 cents for each second
                        }

            if fine_dsc:
                notice_payload = util.str_to_eth_hex(json.dumps(fine_dsc))
                # logger.info("### Notice Payload ###")
                # logger.info(notice_payload)
                # logger.info("### Notice Payload ###")
                logger.info("Adding notice")
                response = requests.post(rollup_server + "/notice", json={ "payload": notice_payload })
                logger.info(f"Received notice status {response.status_code} body {response.content}")

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
            response = requests.post(rollup_server + "/report", json={"payload": result})
            logger.info(f"Received report status {response.status_code}")


        if "select" not in payload_dict:
            generate_report(f"Must have 'select' key! Valid values are: {list(select_options.keys())}")
            return "reject"

            
        conn = db.create_connection(DB_FILE)
        option = payload_dict["select"]
        select_options = {
            "lines": { "required": False, "function": db.select_lines_id },
            "routes": { "required": True, "function": db.select_route_of_line },
            "trips": { "required": True, "function": db.count_trips }
        }
        

        if option not in select_options:
            generate_report(f"Invalid select option! Valid options are: {list(select_options.keys())}")
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
