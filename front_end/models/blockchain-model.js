//const web3_connection = require("../config/eth-connection.js")
const conn = require("../config/eth-connection.js")
const request = require('request');

module.exports = {
    getNoticePage:async function(page, callback) {
        //conn = await web3_connection

        let options = {
            url: 'http://localhost:4000/graphql',
            json: true,
            body: {
                query: 'query processed {GetProcessedInput (query: {input_index: "0"}) {epoch_index} }'
            }
        };

        // Get first Processed Input of each epoch
        // is used to calculate the most recent epoch
        request.post(options, (err, res, body) => {
            if (err) {       
                console.log(err)
                callback(null)
                return
            }

            let val = body.data.GetProcessedInput
            if (!val || val.length == 0) {
                callback(null)
                return
            }

            let current_epoch = 0
            for (var i = 0; i < val.length; i++) {
                let epoch = parseInt(val[i].epoch_index)
                if (val[i].epoch_index > current_epoch) {
                    current_epoch = epoch
                }
            }
        
            
            // Get Notices of epoch "page"
            options.body.query = `query getNotice { GetNotice( query: { epoch_index: "${page}" } ) { session_id epoch_index input_index notice_index payload } }`
            request.post(options, (err, res, body) => {
                if (err) {       
                    console.log(err)
                    callback(null, current_epoch)
                    return
                }
            
                //console.log(`Status: ${res.statusCode}`);        
                //console.log(body);

                const val = body.data.GetNotice
                if (val.length == 0) {
                    callback(null, current_epoch)
                    return
                }
                
                var payloads = new Array(val.length)
                for (var i = 0; i < val.length; i++) {
                    payload = conn.web3.utils.hexToUtf8("0x" + val[i].payload)
                    payloads[i] = JSON.parse(payload)
                }
                callback(payloads, current_epoch)
            });

        })
    },

    getAccounts:async function(callback) {
        //conn = await web3_connection
        
        conn.web3.eth.getAccounts()
        .then(callback)
    },

    addInput:async function(fromAdress, data, success, fail) {
        //conn = await web3_connection
        
        const input_hex = conn.web3.utils.utf8ToHex(data)
        console.log("Input Hex:", input_hex)

        conn.input_contract.methods.addInput(input_hex).send(
                { from: fromAdress }
            )
            .then(success)
            .catch(fail)
    },
}