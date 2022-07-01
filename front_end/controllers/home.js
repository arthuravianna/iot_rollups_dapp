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
        let page
        let req_epoch

        if (!req.query.page) {
            page = 1
        }
        else {
            page = parseInt(req.query.page)
        }
        let filter_options = {}
        filter_options.filterBusLine = req.query.filterBusLine
        filter_options.fineTypeSelector = req.query.fineTypeSelector

        req_epoch = page - 1
        blockchainModel.getNoticePage(req_epoch, filter_options, function(notices, current_epoch) {            
            let last_page
            let pagination // pages array
            let prev_disabled = false // previous page button state
            let next_disabled = false // next page button state
            let url = build_filter_url(filter_options)
            if (url.length < 2) { url = "/?page="}
            else {url = `${url}&page=`}

            if (current_epoch != undefined) {
                last_page = current_epoch + 1
                pagination = []

                if (page == 1) {
                    prev_disabled = true
                }
                if (page == last_page) {
                    next_disabled = true
                }

                if (last_page <= 3) {
                    pagination.push( {"label": "prev", "val": url + (page-1), "title": "Previous-Epoch", "disabled": prev_disabled} )
                    
                    for (var i = 1; i <= last_page; i++) {
                        if (i == page) {
                            pagination.push( {"label": page, "val": url + (page), "title": `Epoch-${req_epoch}`, "disabled": true} )
                        }
                        else {
                            pagination.push( {"label": i, "val": url + (i), "title": `Epoch-${i-1}`, "disabled": false} )
                        }   
                    }
                    
                    pagination.push( {"label": "next", "val": url + (page+1), "title": "Next-Epoch", "disabled": next_disabled} )
                }
                else {
                    pagination.push( {"label": "prev", "val": url + (page-1), "title": "Previous-Epoch", "disabled": prev_disabled} )
                    
                    
                    pagination.push( {"label": 1, "val": url + (1), "title": "Epoch 0", "disabled": false} )
                    if (page - 1 == 2) {
                        pagination.push( {"label": page-1, "val": url + (page-1), "title": `Epoch-${req_epoch-1}`, "disabled": false} )
                    }
                    else {
                        pagination.push( {"label": "...", "val": "", "title": "", "disabled": true} )
                        pagination.push( {"label": page-1, "val": url + (page-1), "title": `Epoch-${req_epoch-1}`, "disabled": false} )
                    }
                    
                    
                    pagination.push( {"label": page, "val": url + (page), "title": `Epoch-${req_epoch}`, "disabled": true} )                                   
                    
                    
                    pagination.push( {"label": page+1, "val": url + (page+1), "title": `Epoch-${req_epoch+1}`, "disabled": true} )
                    if (page + 1 == last_page - 1) {
                        pagination.push( {"label": last_page, "val": url + (last_page), "title": `Epoch-${current_epoch}`, "disabled": false} )
                    }
                    else {
                        pagination.push( {"label": "...", "val": "", "title": "", "disabled": true} ) 
                        pagination.push( {"label": last_page, "val": url + (last_page), "title": `Epoch-${current_epoch}`, "disabled": false} )
                    }
                    
                    pagination.push( {"label": "next", "val": url + (page+1), "title": "Next-Epoch", "disabled": next_disabled} )
                }
            }

            // console.log(notices)
            // console.log(pagination)
            res.render("index", {"notices": notices, "pagination": pagination, "filter_options": filter_options});
        });
    },

    homePageFilter:function(req, res) {
        let url ="/"
        if (req.body.submitButton == "0") {
            res.redirect(url)
            return
        }

        let filter_options = req.body

        if (filter_options.filterBusLine == "" && filter_options.fineTypeSelector == "0") {
            res.redirect(url)
        }

        if (filter_options.fineTypeSelector == "0") {
            filter_options.fineTypeSelector = null
        }
        
        url = build_filter_url(filter_options)

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
}