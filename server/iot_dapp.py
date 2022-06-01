########################
### Cartesi Rollups v0.2
########################

from os import environ
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
    #logger.info(f"Received advance request data {data}")

    ### payload to UTF-8
    payload_utf8 = util.hex_to_str(data["payload"])
    logger.info(f"Payload UTF-8 {payload_utf8}")

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
        
        # get stop
        stops = db.select_stops(conn, bus_id)
        stop_id = util.next_stop(curr_lat, curr_lon, stops) 

        # check route
        route = db.select_route_of_line(conn, bus_id)
        if route is None:
            conn.close()
            return "reject"

        fine_dsc = None

        if not util.in_route(curr_lat, curr_lon, route):
            fine_dsc = {
                "ts": ts,
                "dsc": ["Different route"],
                "bus_line": bus_id,
                "trip": trip_id,
                "value": 5
            }


        # check schedule
        if stop_id is not None:
            result = db.select_stop_schedule(conn, stop_id, bus_id, trip_id)
            if result is None:
                conn.close()
                return "reject"
            
            stop, stop_time = result
        
            if util.is_late(ts, curr_lat, curr_lon, stop, stop_time):
                if fine_dsc is None:
                    fine_dsc = {
                        "ts": ts,
                        "dsc": ["Late, according to Schedule"],
                        "bus_line": bus_id,
                        "trip": trip_id,
                        "value": 10
                    }

        if fine_dsc:
            notice_payload = util.str_to_eth_hex(json.dumps(fine_dsc))
            logger.info("### Notice Payload ###")
            logger.info(notice_payload)
            logger.info("### Notice Payload ###")
            logger.info("Adding notice")
            response = requests.post(rollup_server + "/notice", json={ "payload": notice_payload })
            logger.info(f"Received notice status {response.status_code} body {response.content}")

    conn.close()
    return "accept"


def handle_inspect(data):
    logger.info(f"Received inspect request data {data}")
    logger.info("Adding report")
    report = {"payload": data["payload"]}
    response = requests.post(rollup_server + "/report", json=report)
    logger.info(f"Received report status {response.status_code}")
    return "accept"



handlers = {
    "advance_state": handle_advance,
    "inspect_state": handle_inspect,
}

finish = {"status": "accept"}
while True:
    logger.info("Sending finish")
    response = requests.post(rollup_server + "/finish", json=finish)
    logger.info(f"Received finish status {response.status_code}")
    if response.status_code == 202:
        logger.info("No pending rollup request, trying again")
    else:
        rollup_request = response.json()
        handler = handlers[rollup_request["request_type"]]
        finish["status"] = handler(rollup_request["data"])