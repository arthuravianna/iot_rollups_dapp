var blockchainModel = require('../models/blockchain-model.js');


module.exports={
    homePage:function(req, res) {
        blockchainModel.getAccounts(function(result) {
            res.render("index", { "accounts": result });
        })
    },

    formSubmit:function(req, res) {
        blockchainModel.addInput(req.query.fromAddress, req.query.input, function(result) {
            //res.redirect("/");
            console.log("addInput:", result)
            //res.jsonp({success: true, data: result})
            res.json({success: true, result: "Added Input: " + result})
        })
    },
}