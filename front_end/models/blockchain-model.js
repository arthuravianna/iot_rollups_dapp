const conn = require("../config/eth-connection.js")
const request = require('request');


const page_size = 15 // 15 notices per page


function build_dataset(obj_arr, data) {
    for (let i = 0; i < obj_arr.length; i++) {
        let curr_obj = obj_arr[i]
        let pos
        if (data.length == 24) { // by hour
            pos = curr_obj.x.getHours()
        }
        else if (data.length == 12) {  // by month
            pos = curr_obj.x.getMonth()
        }
        else { //by day
            pos = curr_obj.x.getDate()
        }

        if (!data[pos]) {
            data[pos] = []
        }
        data[pos].push(curr_obj.y)
    }

    for (let i = 0; i < data.length; i++) {
        if (!data[i]) {
            data[i] = 0
            continue
        }
        
        let avg = 0
        for (let j = 0; j < data[i].length; j++) {
            avg += data[i][j]
        }
        data[i] = avg / data[i].length
    }
}

function build_ts(ts_dict, min_date, max_date) {
    let labels = []
    let datasets = {}

    let delta = max_date - min_date // delta in milliseconds
    let year = min_date.getFullYear()
    let month = min_date.getMonth()
    let day = min_date.getDate()

    if (delta <= 86400000) { // day
        for (let i = 0; i < 24; i++) {
            //let date = new Date(min_date.getFullYear(),min_date.getMonth(), min_date.getDate(), i)
            let hour_str = i.toString()
            if (hour_str.length < 2) { hour_str = 0 + hour_str }

            let date = `${year}-${month}-${day} ${hour_str}:00:00`
            labels.push(date)
        }
    }
    // else if (delta <= 604800017) { // week

    // }
    else if (delta <= 2629800000) { // month
        let n_days = new Date(min_date.getFullYear, min_date.getMonth, 0).getDate()
        for (let i = 0; i < n_days; i++) {
            //let date = new Date(min_date.getFullYear(),min_date.getMonth(), i)
            let day_str = i.toString()
            if (day_str.length < 2) { day_str = 0 + day_str }

            let date = `${year}-${month}-${day_str}`
            labels.push(date)
        }
    }
    else if (delta <= 31557600000) { // year
        for (let i = 0; i < 12; i++) {
            //let date = new Date(min_date.getFullYear(), i)
            let month_str = i.toString()
            if (month_str.length < 2) { month_str = 0 + month_str }

            let date = `${year}-${month_str}`
            labels.push(date)
        }
    }

    for (let key in ts_dict) {
        datasets[key] = new Array(labels.length)
        build_dataset(ts_dict[key], datasets[key])
    }

    let result = {"labels": labels, "datasets": datasets}
    return result
}

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
                let min_date
                let max_date
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
                    let ts_date = new Date(payload.ts)
                    if (!(time_series.hasOwnProperty(payload.bus_line))) {
                        time_series[payload.bus_line] = [{x: ts_date, y: payload.value}]
                    }
                    else {
                        time_series[payload.bus_line].push({x: ts_date, y: payload.value})
                    }

                    // att min and max ts
                    if (!min_date || ts_date < min_date) {
                        min_date = ts_date
                    }
                    if (!max_date || ts_date > max_date) {
                        max_date = ts_date
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

                //callback(notices_table, time_series, histogram, current_epoch)
                callback(notices_table, build_ts(time_series, min_date, max_date), histogram, current_epoch)
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