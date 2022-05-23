const Web3 = require('web3')


const provider = "http://localhost:8545" // node running Hardhat
const web3 = new Web3(Web3.givenProvider || provider)

web3.eth.getAccounts().then(console.log).catch(function(error) {console.log("Error: Couldn't get accounts list!")});

const hardhat = require("../public/ABI/localhost.json")
const rollups_contract = new web3.eth.Contract(hardhat.contracts.RollupsFacet.abi, hardhat.contracts.CartesiDApp.address)
const input_contract = new web3.eth.Contract(hardhat.contracts.InputFacet.abi, hardhat.contracts.CartesiDApp.address)

module.exports = { web3: web3, rollups_contract: rollups_contract, input_contract: input_contract }