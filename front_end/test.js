const Web3 = require('web3');
const rollups = require("./public/ABI/localhost/RollupsFacet.json")
const input = require("./public/ABI/localhost/InputFacet.json")


const provider = "http://localhost:8545" // node running Hardhat
const web3 = new Web3(Web3.givenProvider || provider);

//web3.eth.defaultAccount = ... // to set a default "from" parameter
//web3.eth.getAccounts().then(console.log).catch(function(error) {console.log("Error: Couldn't get accounts list!")});


const rollups_contract = new web3.eth.Contract(rollups.abi, rollups.address)
const input_contract = new web3.eth.Contract(input.abi, input.address)


const input_hex = "0x63617274657369"

rollups_contract.methods.getCurrentEpoch().send({ from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" })
.then(function(result) {
    console.log("Current Epoch:", result)
})
.catch(function(error) {
    console.log(error)
})

input_contract.methods.getInput(0).send({ from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" })
.then(function(result) {
    console.log("getInput:", result)
})
.catch(function(error) {
    console.log(error)
})

input_contract.methods.addInput(input_hex).send({ from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" })
.then(function(result) {
    console.log("addInput:", result)
})
.catch(function(error) {
    console.log(error)
})
