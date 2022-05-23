const Web3 = require('web3');

const provider = "http://localhost:8545" // node running Hardhat
const web3 = new Web3(Web3.givenProvider || provider);


const hardhat = require("./public/ABI/localhost.json")
const rollups_contract = new web3.eth.Contract(hardhat.contracts.RollupsFacet.abi, hardhat.contracts.CartesiDApp.address)
const input_contract = new web3.eth.Contract(hardhat.contracts.InputFacet.abi, hardhat.contracts.CartesiDApp.address)

// web3.eth.defaultAccount = ... // to set a default "from" parameter
web3.eth.getAccounts()
.then(function(result) {
    accounts = result

    console.log("Account:", accounts[0])
    rollups_contract.methods.getCurrentEpoch().send({ from: accounts[0] })
    .then(function(result) {
        console.log("Current Epoch:", result)
    })
    .catch(function(error) {
        console.log(error)
    })

    // Echo DApp input
    // const input_hex = "0x63617274657369"

    // my DApp input
    const input_obj = { "bus_id":  "18C", "trip_id": "18C;1", "lat": 57.82847892, "lon": 26.53362055, "ts": "2022-03-25 12:46:30" }
    const input_hex = web3.utils.utf8ToHex(JSON.stringify(input_obj))
    console.log("Input Hex:", input_hex)

    input_contract.methods.addInput(input_hex).send({ from: accounts[0] })
    .then(function(result) {
        console.log("addInput:", result)
    })
    .catch(function(error) {
        console.log("AddInput", error)
    })
    
})
.catch(function(error) {
    console.log("Error: Couldn't get accounts list!")
});
