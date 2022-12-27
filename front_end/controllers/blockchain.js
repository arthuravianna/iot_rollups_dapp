var blockchainModel = require('../models/blockchain-model.js');

module.exports={
    submit:function(req, res) {
        let json = req.body

        try {
            let vehicle_input = false
            let schedule_input = false

            // check if is vehicle input
            const has_bus_id = json.hasOwnProperty("line_id")
            const has_trip_id = json.hasOwnProperty("trip_id")
            const has_lat = json.hasOwnProperty("lat")
            const has_lon = json.hasOwnProperty("lon")
            const has_ts = json.hasOwnProperty("ts")

            if (has_bus_id && has_trip_id && has_lat && has_lon && has_ts) {
                vehicle_input = true
            }

            const has_data = json.hasOwnProperty("data")
            const has_sha256 = json.hasOwnProperty("sha256")
            const has_ed25519 = json.hasOwnProperty("Ed25519")
            const has_public_key = json.hasOwnProperty("public_key")

            if (has_data && has_sha256 && has_ed25519 && has_public_key) {
                vehicle_input = true
            }

            // check if is schedule input
            if (!vehicle_input) {
                const has_bus_id = json.hasOwnProperty("line_id")
                const has_route = json.hasOwnProperty("route")
                const has_stops = json.hasOwnProperty("stops")
                const has_schedule = json.hasOwnProperty("schedule")

                if (has_bus_id && has_route && has_stops && has_schedule) {
                    schedule_input = true
                }
            }

            if (!(vehicle_input || schedule_input)) {
                throw "Error: Invalid Input."
            }
        }
        catch (error) {
            console.log("ERROR", error)
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