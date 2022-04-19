var blockchainModel = require('../models/blockchain-model.js');


module.exports={
    homePage:function(req, res) {
        let page
        if (!req.query.page) {
            page = 1
        }
        else {
            page = parseInt(req.query.page)
        }

        blockchainModel.getNoticePage(page-1, function(notices, current_epoch) {            
            let last_page
            let pagination

            if (current_epoch != undefined) {
                last_page = current_epoch + 1
                pagination = []

                if (last_page == 1) {
                    pagination.push( {"val": "prev", "disabled": true} )
                    pagination.push( {"val": page, "disabled": false} )
                    pagination.push( {"val": "next", "disabled": true} )
                }
                else if (last_page <= 3) {
                    pagination.push( {"val": "prev", "disabled": false} )
                    for (var i = 1; i <= last_page; i++) {
                        if (i == page) {
                            pagination.push( {"val": i, "disabled": true} )
                        }
                        else {
                            pagination.push( {"val": i, "disabled": false} )
                        }   
                    }                    
                    pagination.push( {"val": "next", "disabled": false} )
                }
                else {
                    pagination.push( {"val": "prev", "disabled": false} )
                    
                    if (page - 1 == 1) {
                        pagination.push( {"val": 1, "disabled": false} )
                    }
                    else {
                        pagination.push( {"val": 1, "disabled": false} )
                        pagination.push( {"val": "...", "disabled": true} )
                        pagination.push( {"val": page-1, "disabled": false} )
                    }

                    pagination.push( {"val": page, "disabled": true} )
                
                    if (page + 1 == last_page) {
                        pagination.push( {"val": page+1, "disabled": false} )
                        pagination.push( {"val": "next", "disabled": true} )
                    }
                    else {
                        pagination.push( {"val": "...", "disabled": true} )
                        pagination.push( {"val": page+1, "disabled": false} )
                        pagination.push( {"val": "next", "disabled": false} )
                    }
                }
            }

            // console.log(notices)
            // console.log(pagination)
            res.render("index", {"notices": notices, "pagination": pagination});
        });
    },

    formPage:function(req, res) {
        blockchainModel.getAccounts(function(result) {
            res.render("form", { "accounts": result });
        })
    },

    submit:function(req, res) {
        // console.log("POST Body: ", req.body)
        blockchainModel.addInput(req.body.fromAddress, req.body.data,
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