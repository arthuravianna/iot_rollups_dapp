const Web3 = require('web3')
const fs = require('fs')


const provider = "http://localhost:8545" // node running Hardhat
const notices_db_url = "http://localhost:4000/graphql"
const dapp_inspect_url = " http://localhost:5005/inspect"
const web3 = new Web3(Web3.givenProvider || provider)

web3.eth.getAccounts()
.then(function(result) {
    web3.eth.defaultAccount = result[4] // to set a default "from" parameter
    console.log("Default Account:", web3.eth.defaultAccount)
})
.catch(function(error) {
    console.log("Error: Couldn't get accounts list!\n", error)
});

// Cartesi Rollups 0.3
const address = fs.readFileSync("public/deployments/dapp.address", 'utf8');

const blockchain_obj = require("../public/ABI/blockchain.json")

const rollups_contract_obj = blockchain_obj.contracts.RollupsFacet
const rollups_contract = new web3.eth.Contract(rollups_contract_obj.abi, address)
const input_contract_obj = blockchain_obj.contracts.InputFacet
const input_contract = new web3.eth.Contract(input_contract_obj.abi, address)

module.exports = { 
    web3: web3,
    rollups_contract: rollups_contract,
    input_contract: input_contract,
    notices_db_url: notices_db_url,
    dapp_inspect_url: dapp_inspect_url,
    metamask_conn_config: { abi: input_contract_obj.abi, address: address }
}