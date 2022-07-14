var blockchainModel = require('../models/blockchain-model.js');


function build_filter_url(filter_options) {
    let url = "/"
    if (filter_options.filterBusLine && filter_options.fineTypeSelector) {
        url = `/?filterBusLine=${filter_options.filterBusLine}&fineTypeSelector=${filter_options.fineTypeSelector}`
    }
    else if (filter_options.filterBusLine) {
        url = `/?filterBusLine=${filter_options.filterBusLine}`
    }
    else if (filter_options.fineTypeSelector) {
        url = `/?fineTypeSelector=${filter_options.fineTypeSelector}`
    }

    return url
}

module.exports={
    homePage:function(req, res) {
        let req_epoch

        if (!req.query.epoch) {
            req_epoch = 0
        }
        else {
            req_epoch = parseInt(req.query.epoch)
        }

        let filter_options = {}
        filter_options.filterBusLine = req.query.filterBusLine
        filter_options.fineTypeSelector = req.query.fineTypeSelector

        blockchainModel.getNoticePage(req_epoch, filter_options, function(notices_table, time_series, histogram, current_epoch) {
            res.render("index", {
                "notices_table": notices_table,
                "ts": time_series,
                "hist": histogram,
                "filter_options": filter_options,
                "current_epoch": current_epoch,
                "req_epoch": req_epoch
            });
        });
    },

    homePageFilter:function(req, res) {
        let url ="/"
        if (req.body.submitButton == "0") {
            res.redirect(url)
            return
        }

        let filter_options = req.body

        // if (filter_options.filterBusLine == "" && filter_options.fineTypeSelector == "0") {
        //     res.redirect(url)
        //     return
        // }

        if (filter_options.fineTypeSelector == "0") {
            filter_options.fineTypeSelector = null
        }
        
        url = build_filter_url(filter_options)

        if (url.length > 1) {
            url = url + `&epoch=${filter_options.epochSelector}`
        }
        else {
            url = url + `?epoch=${filter_options.epochSelector}`
        }

        res.redirect(url)
    },

    formPage:function(req, res) {
        blockchainModel.getAccounts(function(result) {
            res.render("form", { "accounts": result });
        })
    },

    submit:function(req, res) {
        let json = req.body

        try {
            let vehicle_input = false
            let schedule_input = false

            // check if is vehicle input
            const has_bus_id = json.hasOwnProperty("bus_id")
            const has_trip_id = json.hasOwnProperty("trip_id")
            const has_lat = json.hasOwnProperty("lat")
            const has_lon = json.hasOwnProperty("lon")
            const has_ts = json.hasOwnProperty("ts")

            if (has_bus_id && has_trip_id && has_lat && has_lon && has_ts) {
                vehicle_input = true
            }

            // check if is schedule input
            if (!vehicle_input) {
                const has_route = json.hasOwnProperty("route")
                const has_stops = json.hasOwnProperty("stops")
                const has_schedule = json.hasOwnProperty("schedule")

                if (has_bus_id && has_route && has_stops && has_schedule) {
                    schedule_input = true
                    json.new_schedule = true // must add to back-end
                }
            }

            if (!(vehicle_input || schedule_input)) {
                throw "Error: Invalid Input."
            }
        }
        catch (error) {
            res.json({success: false, result: error})
            return
        }

        blockchainModel.addInput(JSON.stringify(json),
            function(result) {
                res.json({success: true, result: "Tx Hash: " + result.transactionHash})
            },
            function(error) {
                res.json({success: false, result: error})
            }
        )
    },

    query:function(req, res) {
        let json = req.body
        if (!(json.hasOwnProperty("epoch") && json.hasOwnProperty("select"))) {
            res.json({success: false, result: "Body must have 'epoch' and 'select'!"})
            return
        }

        blockchainModel.getData(json.epoch, json.select,
            function(result){
                res.json({success: true, result: result})
            },
            function(error) {
                res.json({success: false, result: error})
            }
        )
    },
}