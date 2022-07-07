const conn = require("../config/eth-connection.js")
const request = require('request');

module.exports = {
    getNoticePage:async function(page, filter_options, callback) {
        let options = {
            url: 'http://localhost:4000/graphql',
            json: true,
            body: {
                query: 'query processed {GetProcessedInput (query: {input_index: "0"}) {epoch_index} }'
                // query: `query getNotice { GetNotice( query: { input_index: "0" } ) { epoch_index index payload } }`
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
            // let val = body.data.GetNotice
            if (!val || val.length == 0) {
                callback(null)
                return
            }

            let current_epoch = 0
            for (var i = 0; i < val.length; i++) {
                // // apply filter
                // if (filter_options) {
                //     let payload = JSON.parse(conn.web3.utils.hexToUtf8("0x" + val[i].payload))
                //     if (filter_options.filterBusLine && payload.bus_line != filter_options.filterBusLine) {
                //         continue
                //     }
                //     else if (filter_options.fineTypeSelector && payload.tp != filter_options.fineTypeSelector) {
                //         continue
                //     }
                // }
                

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
                
                let payloads = new Array()
                //console.log(filter_options)
                for (var i = 0; i < val.length; i++) {
                    let payload = JSON.parse(conn.web3.utils.hexToUtf8("0x" + val[i].payload))
                    // apply filter
                    if (filter_options.filterBusLine && (payload.bus_line != filter_options.filterBusLine)) {
                        //console.log("Diff:",payload.bus_lin, filter_options.filterBusLine)
                        continue
                    }
                    else if (filter_options.fineTypeSelector && (payload.tp != filter_options.fineTypeSelector)) {
                        //console.log("Diff:",payload.tp, filter_options.fineTypeSelector)
                        continue
                    }

                    payload.epoch_index = val[i].epoch_index
                    payload.input_index = val[i].input_index
                    payloads.push(payload)
                }
                if (payloads.length == 0) {
                    payloads = null
                }
                callback(payloads, current_epoch)
            });

        })
    },

    getAccounts:async function(callback) {
        conn.web3.eth.getAccounts()
        .then(callback)
    },

    addInput:async function(input, success, fail) {
        const input_hex = conn.web3.utils.utf8ToHex(input)
        // console.log("Input Hex:", input_hex)

        conn.input_contract.methods.addInput(input_hex).send({ from: conn.web3.eth.defaultAccount })
            .then(success)
            .catch(fail)
    },
}