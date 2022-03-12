const blockchain_conn = require("../config/eth-connection.js")


module.exports = {
    getAccounts:function(callback) {
        blockchain_conn.eth.getAccounts().then(callback)
    },

    addInput:function(fromAdress, input, callback) {
        // blockchain_conn.input_contract.methods.addInput(input).call(
        //     { from: fromAdress }
        // ).then(callback)

        blockchain_conn.input_contract_func(function(inputContract) {
            inputContract.methods.addInput(input).call(
                { from: fromAdress }
            ).then(callback)
        })
    }
}