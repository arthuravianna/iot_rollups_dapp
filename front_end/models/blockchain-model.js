const web3_connection = require("../config/eth-connection.js")


module.exports = {
    getAccounts:async function(callback) {
        conn = await web3_connection
        
        conn.web3.eth.getAccounts()
        .then(callback)
    },

    addInput:async function(fromAdress, data, success, fail) {
        conn = await web3_connection
        
        const input_hex = conn.web3.utils.utf8ToHex(data)
        // console.log("Input Hex:", input_hex)

        conn.input_contract.methods.addInput(input_hex).send(
                { from: fromAdress }
            )
            .then(success)
            .catch(fail)
    },
}