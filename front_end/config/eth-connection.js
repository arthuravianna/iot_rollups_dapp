const Web3 = require('web3')


const provider = "http://localhost:8545" // node running Hardhat
const web3 = new Web3(Web3.givenProvider || provider)


const rollups_contract_addr = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"
const rollups_jsonInterface = require("../public/ABI/RollupsImpl_ABI.json")
const rollups_contract = new web3.eth.Contract(rollups_jsonInterface, rollups_contract_addr)


var input_contract
const input_jsonInterface = require("../public/ABI/InputImpl_ABI.json")
// rollups_contract.methods.getInputAddress().call({ from: "0xcd3b766ccdd6ae721141f452c550ca635964ce71" })
// .then(function(result) {
//         input_contract_addr = result
//         //console.log("Input Contract Address: " + input_contract_addr)

//         input_contract = new web3.eth.Contract(input_jsonInterface, input_contract_addr)
//     })
// .catch(function(error) { 
//         console.log("Error: Couldn't get Input contract address!")
//     })
const input_contract_func = function(callback) {
    rollups_contract.methods.getInputAddress().call({ from: "0xcd3b766ccdd6ae721141f452c550ca635964ce71" })
    .then(function (result) { // result is Input contract address
        const input_contract_addr = result

        input_contract = new web3.eth.Contract(input_jsonInterface, input_contract_addr)

        callback(input_contract)
    })
}

//module.exports = { eth: web3.eth, rollups_contract: rollups_contract, input_contract: input_contract }
module.exports = { eth: web3.eth, rollups_contract: rollups_contract, input_contract_func: input_contract_func }
