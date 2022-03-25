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
import logging
import requests
from flask import Flask, request
import json

import db_manager as db
import util

DB_FILE = "schedules.db"

app = Flask(__name__)
app.logger.setLevel(logging.INFO)

dispatcher_url = environ["HTTP_DISPATCHER_URL"]
app.logger.info(f"HTTP dispatcher url is {dispatcher_url}\n\n")

@app.route("/advance", methods=["POST"])
def advance():
    body = request.get_json()
    
    ### payload to UTF-8
    payload_utf8 = util.hex_to_str(body["payload"])
    # app.logger.info(f"#############################")
    # app.logger.info(f"Payload UTF-8: {payload_utf8}")
    # app.logger.info(f"#############################\n")

    ### managing database
    conn = db.create_connection(DB_FILE)


    payload_dict = json.loads(payload_utf8)
    #### is new Schedule
    if "new_schedule" in payload_dict:
        count = 0
        bus_id = payload_dict["bus_id"] # bus line id
        route = payload_dict["route"]
        stops = payload_dict["stops"]
        db.insert_bus_line(conn, bus_id, route)
        
        for schedule in payload_dict["schedule"]:
            count += 1
            trip_id = f"{bus_id};{count}"
            db.insert_trip_schedule(conn, trip_id, bus_id, schedule)
        
        stop_id = 0
        for stop in stops:
            stop_id += 1
            db.insert_stop(conn, stop_id, bus_id, stop)

    else:
        # check route
        route = db.select_route_of_line(conn, payload_dict["bus_id"])

        # check schedule
        stop, stop_time = db.select_stop_schedule(conn, payload_dict["next_stop"], payload_dict["bus_id"], payload_dict["trip_id"])

        fine_dsc = None

        if not util.in_route(payload_dict["lat"], payload_dict["lon"], route):
            fine_dsc = {
                "ts": payload_dict["ts"],
                "dsc": ["Different route"],
                "bus_line": payload_dict["bus_id"],
                "trip": payload_dict["trip_id"],
                "value": 5
            }


        if util.is_late(payload_dict["ts"], payload_dict["lat"], payload_dict["lon"], stop, stop_time):
            if fine_dsc is None:
                fine_dsc = {
                    "ts": payload_dict["ts"],
                    "dsc": ["Late, according to Schedule"],
                    "bus_line": payload_dict["bus_id"],
                    "trip": payload_dict["trip_id"],
                    "value": 10
                }
            else:
                fine_dsc["value"] += 10
                fine_dsc["dsc"].append("Late, according to Schedule")

        if fine_dsc:
            notice_payload = util.str_to_eth_hex(str(fine_dsc))
            app.logger.info("### Notice Payload ###")
            app.logger.info(notice_payload)
            app.logger.info("### Notice Payload ###")
            app.logger.info("Adding notice")
            response = requests.post(dispatcher_url + "/notice", json={ "payload": notice_payload })
            app.logger.info(f"Received notice status {response.status_code} body {response.content}")



    ### request to /finish to complete
    app.logger.info("Finishing")
    response = requests.post(dispatcher_url + "/finish", json={"status": "accept"})
    app.logger.info(f"Received finish status {response.status_code}")
    
    return "", 202


@app.route("/inspect/<payload>", methods=["GET"])
def inspect(payload):
    app.logger.info(f"Received inspect request payload {payload}")
    return {"reports": [{"payload": payload}]}, 200