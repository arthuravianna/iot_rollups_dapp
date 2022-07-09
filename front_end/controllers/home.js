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

        if (!req.query.epoch) {
            req_epoch = 0
        }
        else {
            req_epoch = parseInt(req.query.epoch)
        }
        if (!req.query.page) {
            page = 1
        }
        else {
            page = parseInt(req.query.page)
        }
        let filter_options = {}
        filter_options.filterBusLine = req.query.filterBusLine
        filter_options.fineTypeSelector = req.query.fineTypeSelector

        //req_epoch = page - 1
        blockchainModel.getNoticePage(req_epoch, page, filter_options, function(notices, current_epoch, num_pages) {            
            let pagination // pages array
            let next_epoch
            let prev_epoch
            let prev_disabled = false // previous page button state
            let next_disabled = false // next page button state
            let url = build_filter_url(filter_options)
            if (url.length < 2) { url = "/?page="}
            else {url = `${url}&page=`}

            if (current_epoch != undefined) {
                pagination = []

                // if (req_epoch === undefined) {
                //     req_epoch = current_epoch
                // }

                // page check
                if (page == 1) {
                    prev_disabled = true
                }
                if (page == num_pages) {
                    next_disabled = true
                }

                // epoch check
                if (req_epoch < current_epoch) {
                    next_epoch = req_epoch + 1
                }
                if (req_epoch > 0) {
                    prev_epoch = req_epoch - 1
                }

                // previous button
                if (prev_epoch != undefined && page == 1) {
                    pagination.push( {"label": "prev epoch", "val": `${url + (1)}&epoch=${prev_epoch}`, "title": "Previous-Epoch", "disabled": false} )
                }
                else {
                    pagination.push( {"label": "prev", "val": `${url + (page-1)}&epoch=${req_epoch}`, "title": "Previous-Page", "disabled": prev_disabled} )
                }

                if (num_pages <= 5) {
                    for (var i = 1; i <= num_pages; i++) {
                        if (i == page) {
                            pagination.push( {"label": page, "val": `${url + (page)}&epoch=${req_epoch}`, "title": `Page-${page}`, "disabled": true} )
                        }
                        else {
                            pagination.push( {"label": i, "val": `${url + (i)}&epoch=${req_epoch}`, "title": `Page-${i}`, "disabled": false} )
                        }   
                    }                  
                }
                else {
                    if (page - 3 > 1) {
                        pagination.push( {"label": 1, "val": `${url + (1)}&epoch=${req_epoch}`, "title": `Page-${1}`, "disabled": false} )
                        pagination.push( {"label": "...", "val": "", "title": "", "disabled": true} )
                        pagination.push( {"label": page-1, "val": `${url + (page-1)}&epoch=${req_epoch}`, "title": `Page-${page-1}`, "disabled": false} )
                    }
                    else {
                        for (let i = 1; i < page; i++) {
                            pagination.push( {"label": i, "val": `${url + (i)}&epoch=${req_epoch}`, "title": `Page-${i}`, "disabled": false} )
                        }
                    }
                    
                    pagination.push( {"label": page, "val": `${url + (page)}&epoch=${req_epoch}`, "title": `Page-${page}`, "disabled": true} )

                    if (page + 3 < num_pages) {
                        pagination.push( {"label": page+1, "val": `${url + (page+1)}&epoch=${req_epoch}`, "title": `Page-${page+1}`, "disabled": false} )
                        pagination.push( {"label": "...", "val": "", "title": "", "disabled": true} )
                        pagination.push( {"label": num_pages, "val": `${url + (num_pages)}&epoch=${req_epoch}`, "title": `Epoch-${req_epoch}`, "disabled": false} )
                    }
                    else {
                        for (let i = page+1; i <= num_pages; i++) {
                            pagination.push( {"label": i, "val": `${url + (i)}&epoch=${req_epoch}`, "title": `Page-${i}`, "disabled": false} )
                        }
                    }
                }

                // next button
                if (next_epoch != undefined && page == num_pages) {
                    pagination.push( {"label": "next epoch", "val": `${url + 1}&epoch=${next_epoch}`, "title": "Next-Epoch", "disabled": false} )
                }
                else {
                    pagination.push( {"label": "next", "val": `${url + (page+1)}&epoch=${req_epoch}`, "title": "Next-Page", "disabled": next_disabled} )
                }

            }

            // console.log(notices)
            // console.log(pagination)
            res.render("index", {
                "notices": notices,
                "pagination": pagination,
                "filter_options": filter_options,
                "current_epoch": current_epoch,
                "req_epoch": req_epoch}
                );
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

    }
}