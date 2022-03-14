var blockchainModel = require('../models/blockchain-model.js');


module.exports={
    homePage:function(req, res) {
        blockchainModel.getAccounts(function(result) {
            res.render("index", { "accounts": result });
        })
    },

    formSubmit:function(req, res) {
        console.log("POST Body: ", req.body)
        blockchainModel.addInput(req.body.fromAddress, req.body.lat, req.body.lon,
            function(result) {
                //console.log("addInput:", result)
                res.json({success: true, result: "Tx Hash: " + result.transactionHash})
            },
            function(error) {
                //console.log(error)
                const error_str =   "## ERROR ##" + 
                                    "\nreason: " + error.reason +
                                    "\ncode: " + error.code + 
                                    "\nargument: " + error.argument +
                                    "\nvalue: "  + error.value
                res.json({success: false, result: error_str})
            }
        )
    },
}