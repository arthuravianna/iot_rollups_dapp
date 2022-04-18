const web3_connection = require("../config/eth-connection.js")
const request = require('request');

module.exports = {
    getNoticePage:async function(page, filter, callback) {
        conn = await web3_connection

        const options = {
            url: 'http://localhost:4000/graphql',
            json: true,
            body: {
                query: "query getNotice { GetNotice( query: { } ) { session_id epoch_index input_index notice_index payload } }"
            }
        };

        request.post(options, (err, res, body) => {
            if (err) {       
                console.log(err)
                return callback(null)
            }
        
            //console.log(`Status: ${res.statusCode}`);        
            //console.log(body);

            const val = body.data.GetNotice
            if (!val || val.length == 0) {
                callback(null)
            }
            else {
                var payloads = new Array(val.length)
                for (var i = 0; i < val.length; i++) {
                    payload = conn.web3.utils.hexToUtf8("0x" + val[i].payload)
                    //console.log("payload Hex", val[i].payload)
                    //console.log("payload UTF8", payload)
                    payloads[i] = JSON.parse(payload)
                }
                callback(payloads)
            }
        });

    },

    getAccounts:async function(callback) {
        conn = await web3_connection
        
        conn.web3.eth.getAccounts()
        .then(callback)
    },

    addInput:async function(fromAdress, data, success, fail) {
        conn = await web3_connection
        
        const input_hex = conn.web3.utils.utf8ToHex(data)
        // console.log("Input Hex:", input_hex)

        conn.input_contract.methods.addInput(input_hex).send(
                { from: fromAdress }
            )
            .then(success)
            .catch(fail)
    },
}