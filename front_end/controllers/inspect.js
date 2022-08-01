var inspectModel = require('../models/inspect-model.js');



module.exports={
    inspect:function(req, res) {
        let json = req.body

        if (!(json.hasOwnProperty("route") || json.hasOwnProperty("bus_id"))) {
            res.json({success: false, result: "Body must have 'route' or 'bus_id'!"})
            return
        }

        inspectModel.doInspect(JSON.stringify(json),
        function (result) {
            res.json({success: true, result: result})
        },
        function (error) {
            res.json({success: false, result: error})
        })
    },
}