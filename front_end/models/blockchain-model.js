const blockchain_conn = require("../config/eth-connection.js")


module.exports = {
    getAccounts:function(callback) {
        blockchain_conn.eth.getAccounts().then(callback)
    },

    addInput:function(fromAdress, input, success, fail) {
        // blockchain_conn.input_contract.methods.addInput(input).call(
        //     { from: fromAdress }
        // ).then(callback)

        blockchain_conn.input_contract_func(function(result) {
            if (result.success == false) {
                fail(result.value)
                return
            }

            const inputContract = result.value
            inputContract.methods.addInput(input).call(
                { from: fromAdress }
            )
            .then(success)
        })
    }
}