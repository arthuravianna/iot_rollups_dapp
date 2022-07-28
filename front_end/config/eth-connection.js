const Web3 = require('web3')
const fs = require('fs')


const provider = "http://localhost:8545" // node running Hardhat
const web3 = new Web3(Web3.givenProvider || provider)

web3.eth.getAccounts()
.then(function(result) {
    web3.eth.defaultAccount = result[4] // to set a default "from" parameter
    console.log("Default Account:", web3.eth.defaultAccount)
})
.catch(function(error) {
    console.log("Error: Couldn't get accounts list!\n",error)
});

// Cartesi Rollups 0.3
const address = fs.readFileSync("public/deployments/localhost/dapp.address", 'utf8');

const rollups_contract_obj = require("../public/deployments/localhost/RollupsFacet.json")
const rollups_contract = new web3.eth.Contract(rollups_contract_obj.abi, address)

const input_contract_obj = require("../public/deployments/localhost/InputFacet.json")
const input_contract = new web3.eth.Contract(input_contract_obj.abi, address)

module.exports = { 
    web3: web3,
    rollups_contract: rollups_contract,
    input_contract: input_contract,
    metamask_conn_config: { abi: input_contract_obj.abi, address: address }
}