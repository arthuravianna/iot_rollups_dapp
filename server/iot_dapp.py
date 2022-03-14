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

import db_manager as db

DB_FILE = "simhashes.db"

def hex_to_string(hex):
    if hex[:2] == '0x':
        hex = hex[2:]
    string_value = bytes.fromhex(hex).decode('utf-8')
    return string_value

def hex_to_bin(hex):
    return bin(int(hex, base=16))[2:]


app = Flask(__name__)
app.logger.setLevel(logging.INFO)

dispatcher_url = environ["HTTP_DISPATCHER_URL"]
app.logger.info(f"HTTP dispatcher url is {dispatcher_url}\n\n")

@app.route("/advance", methods=["POST"])
def advance():
    body = request.get_json()
    
    ### calculate payload's simhash
    payload_utf8 = hex_to_string(body["payload"])
    app.logger.info(f"#############################")
    app.logger.info(f"Payload UTF-8: {payload_utf8}")
    app.logger.info(f"#############################\n")

    ### request to /notice to add info
    app.logger.info(f"Received advance request body {body}")
    
    app.logger.info("Adding notice")
    response = requests.post(dispatcher_url + "/notice", json={"payload": body["payload"]})
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