var blockchainModel = require('../models/blockchain-model.js');


module.exports={
    homePage:function(req, res) {
        blockchainModel.getAccounts(function(result) {
            res.render("index", { "accounts": result });
        })
    },

    formSubmit:function(req, res) {
        console.log("POST", req.body)
        blockchainModel.addInput(req.body.fromAddress, req.body.input,
            function(result) {
                //console.log("addInput:", result)
                res.json({success: true, result: "Added Input: " + result})
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