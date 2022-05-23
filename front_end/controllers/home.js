var blockchainModel = require('../models/blockchain-model.js');


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

        req_epoch = page - 1
        blockchainModel.getNoticePage(req_epoch, function(notices, current_epoch) {            
            let last_page
            let pagination // pages array
            let prev_disabled = false // previous page button state
            let next_disabled = false // next page button state

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
                    pagination.push( {"label": "prev", "val": page-1, "title": "Previous-Epoch", "disabled": prev_disabled} )
                    
                    for (var i = 1; i <= last_page; i++) {
                        if (i == page) {
                            pagination.push( {"label": page, "val": page, "title": `Epoch-${req_epoch}`, "disabled": true} )
                        }
                        else {
                            pagination.push( {"label": i, "val": i, "title": `Epoch-${i-1}`, "disabled": false} )
                        }   
                    }
                    
                    pagination.push( {"label": "next", "val": page+1, "title": "Next-Epoch", "disabled": next_disabled} )
                }
                else {
                    pagination.push( {"label": "prev", "val": page-1, "title": "Previous-Epoch", "disabled": prev_disabled} )
                    
                    
                    pagination.push( {"label": 1, "val": 1, "title": "Epoch 0", "disabled": false} )
                    if (page - 1 == 2) {
                        pagination.push( {"label": page-1, "val": page-1, "title": `Epoch-${req_epoch-1}`, "disabled": false} )
                    }
                    else {
                        pagination.push( {"label": "...", "val": "", "title": "", "disabled": true} )
                        pagination.push( {"label": page-1, "val": page-1, "title": `Epoch-${req_epoch-1}`, "disabled": false} )
                    }
                    
                    
                    pagination.push( {"label": page, "val": page, "title": `Epoch-${req_epoch}`, "disabled": true} )                                   
                    
                    
                    pagination.push( {"label": page+1, "val": page+1, "title": `Epoch-${req_epoch+1}`, "disabled": true} )
                    if (page + 1 == last_page - 1) {
                        pagination.push( {"label": last_page, "val": last_page, "title": `Epoch-${current_epoch}`, "disabled": false} )
                    }
                    else {
                        pagination.push( {"label": "...", "val": "", "title": "", "disabled": true} ) 
                        pagination.push( {"label": last_page, "val": last_page, "title": `Epoch-${current_epoch}`, "disabled": false} )
                    }
                    
                    pagination.push( {"label": "next", "val": page+1, "title": "Next-Epoch", "disabled": next_disabled} )
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
        blockchainModel.addInput(JSON.stringify(req.body),
            function(result) {
                res.json({success: true, result: "Tx Hash: " + result.transactionHash})
            },
            function(error) {
                res.json({success: false, result: error})
            }
        )
    },
}