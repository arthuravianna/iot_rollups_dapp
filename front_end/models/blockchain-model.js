const conn = require("../config/eth-connection.js")
const request = require('request');


const page_size = 15 // 15 notices per page

module.exports = {
    getNoticePage:async function(epoch, page, filter_options, callback) {
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
                let epoch_i = parseInt(val[i].epoch_index)
                if (val[i].epoch_index > current_epoch) {
                    current_epoch = epoch_i
                }
            }

            // if (epoch === undefined) {
            //     epoch = current_epoch
            // }

            // Get Notices of epoch "page"
            options.body.query = `query getNotice { GetNotice( query: { epoch_index: "${epoch}" } ) { session_id epoch_index input_index notice_index payload } }`
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
                let num_pages = parseInt(val.length / page_size)
                if (val.length % page_size != 0) {
                    num_pages++
                }
                //console.log(filter_options)
                for (let i = (page -1)*page_size; i < val.length; i++) {
                    let payload = JSON.parse(conn.web3.utils.hexToUtf8("0x" + val[i].payload))
                    // apply filter
                    if (filter_options.filterBusLine && (payload.bus_line != filter_options.filterBusLine)) {
                        continue
                    }
                    else if (filter_options.fineTypeSelector && (payload.tp != filter_options.fineTypeSelector)) {
                        continue
                    }

                    payload.epoch_index = val[i].epoch_index
                    payload.input_index = val[i].input_index
                    payloads.push(payload)

                    if (payloads.length == page_size) {
                        break
                    }
                }
                if (payloads.length == 0) {
                    payloads = null
                }
                callback(payloads, current_epoch, num_pages)
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

    getData:async function(epoch, select, success, error) {
        let options = {
            url: 'http://localhost:4000/graphql',
            json: true,
            body: {
                query: `query getNotice { GetNotice( query: { epoch_index: "${epoch}" } ) { payload } }`
            }
        };

        request.post(options, (err, res, body) => {
            if (err) {       
                console.log(err)
                error("Unable to get data from GraphQl.")
                return
            }

            const data = body.data.GetNotice
            let response = []
            if (data.length == 0) {
                success(response) // return empty array
                return
            }
          
            if (select.hasOwnProperty("x") && select.hasOwnProperty("y")) {
                for (let i = 0; i < data.length; i++) {
                    let payload = JSON.parse(conn.web3.utils.hexToUtf8("0x" + data[i].payload))
    
                    if (!(payload.hasOwnProperty(select.x) && payload.hasOwnProperty(select.y))) {
                        error(`Notice Payload doesn't have ${select.x} and ${select.y}!`)
                        return
                    }
                    response.push([payload[select.x], payload[select.y]])
                }    
            }
            else if (select.hasOwnProperty("x")) {
                let temp = {}

                for (let i = 0; i < data.length; i++) {
                    let payload = JSON.parse(conn.web3.utils.hexToUtf8("0x" + data[i].payload))
    
                    if (!(payload.hasOwnProperty(select.x))) {
                        error(`Notice Payload doesn't have ${select.x}!`)
                        return
                    }

                    let key = payload[select.x]

                    if (!(temp.hasOwnProperty(key))) {
                        temp[key] = 1
                    }
                    else {
                        temp[key]++
                    }
                }
                for (let x in temp) {
                    response.push({x: x, y: temp[x]})
                }
            }
            else {
                error("Invalid select option!")
                return
            }

            success(response)
        })
    },
}