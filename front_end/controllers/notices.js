var noticesModel = require('../models/notices-model.js');


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

        noticesModel.getNoticePage(req_epoch, filter_options, function(notices_table, time_series, histogram, current_epoch, chainid, metamask_conn_config) {
            res.render("index", {
                "notices_table": notices_table,
                "ts": JSON.stringify(time_series),
                "hist": JSON.stringify(histogram),
                "filter_options": filter_options,
                "current_epoch": current_epoch,
                "req_epoch": req_epoch,
                "chainid": chainid,
                "metamask_conn_config": JSON.stringify(metamask_conn_config),
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

    query:function(req, res) {
        let json = req.body
        if (!(json.hasOwnProperty("epoch") && json.hasOwnProperty("select"))) {
            res.json({success: false, result: "Body must have 'epoch' and 'select'!"})
            return
        }

        if (!(json.select.hasOwnProperty("ts") || json.select.hasOwnProperty("hist"))) {
            res.json({success: false, result: `Invalid select option: ${json.select}`})
            return
        }

        noticesModel.getData(json.epoch, json.select,
            function(result){
                res.json({success: true, result: result})
            },
            function(error) {
                res.json({success: false, result: error})
            }
        )
    },
}