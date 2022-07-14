const conn = require("../config/eth-connection.js")
const request = require('request');


const page_size = 15 // 15 notices per page

module.exports = {
    getNoticePage:async function(epoch, filter_options, callback) {
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
                callback(null, null, null, null)
                return
            }

            let val = body.data.GetProcessedInput
            if (!val || val.length == 0) {
                callback(null, null, null, null)
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
                    callback(null, null, null, current_epoch)
                    return
                }
            
                const val = body.data.GetNotice
                if (val.length == 0) {
                    callback(null, null, null, current_epoch)
                    return
                }
                
                //console.log(filter_options)
                let notices_table = [] // [[payload0,..., payload14], [payload15, ...], ...]
                let time_series = {} // {"bus_line0": [{x: x, y: y}, ...], "bus_line1": [{x: x, y: y}, ...], ...}
                let histogram = [] // [{x: "bus_line0", y: count}]
                let hist_dict = {}
                for (let i = 0; i < val.length; i++) {
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
                    
                    // populate notices table
                    if (notices_table.length > 0 && notices_table[notices_table.length -1].length < page_size) {
                        notices_table[notices_table.length -1].push(payload)
                    }
                    else {
                        notices_table.push([payload]) // new notice page
                    }

                    // populate time series
                    if (!(time_series.hasOwnProperty(payload.bus_line))) {
                        time_series[payload.bus_line] = [{x: payload.ts, y: payload.value}]
                    }
                    else {
                        time_series[payload.bus_line].push({x: payload.ts, y: payload.value})
                    }

                    // counting bus_line fine's
                    if (!(hist_dict.hasOwnProperty(payload.bus_line))) {
                        hist_dict[payload.bus_line] = 1
                    }
                    else {
                        hist_dict[payload.bus_line]++
                    }
                }
                if (notices_table.length == 0) {
                    callback(null, null, null, current_epoch)
                    return
                }

                for (let x in hist_dict) {
                    histogram.push({x: x, y: hist_dict[x]})
                }

                callback(notices_table, time_series, histogram, current_epoch)
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
                if (select.hasOwnProperty("datasetKey")) {
                    let temp = {}
                    for (let i = 0; i < data.length; i++) {
                        let payload = JSON.parse(conn.web3.utils.hexToUtf8("0x" + data[i].payload))
                        
                        
                        let key = payload[select.datasetKey]

                        if (!(temp.hasOwnProperty(key))) {
                            temp[key] = [{x: payload[select.x], y: payload[select.y]}]
                        }
                        else {
                            temp[key].push({x: payload[select.x], y: payload[select.y]})
                        }
                    }

                    for (let key in temp) {
                        temp[key].sort((a, b) => {
                            if (a.x < b.x) {
                                return -1;
                            }
                            if (a.x > b.x) {
                                return 1;
                            }
                        })
                    }
                    response = temp
                }
                else {
                    for (let i = 0; i < data.length; i++) {
                        let payload = JSON.parse(conn.web3.utils.hexToUtf8("0x" + data[i].payload))
        
                        if (!(payload.hasOwnProperty(select.x) && payload.hasOwnProperty(select.y))) {
                            error(`Notice Payload doesn't have ${select.x} and ${select.y}!`)
                            return
                        }
                        response.push([payload[select.x], payload[select.y]])
                    }
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