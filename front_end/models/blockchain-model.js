const web3_connection = require("../config/eth-connection.js")


module.exports = {
    getAccounts:async function(callback) {
        conn = await web3_connection
        conn.web3.eth.getAccounts()
        .then(callback)
    },

    addInput:async function(fromAdress, input, success, fail) {
        conn = await web3_connection
        if (!conn.web3.utils.isHex(input)) {
            fail( {reason: "invalid arrayify value", code: "INVALID_ARGUMENT", argument: "value", value: input} )
            return
        }
        conn.input_contract.methods.addInput(input).call(
                { from: fromAdress }
            )
            .then(success)
            .catch(fail)
    },
}