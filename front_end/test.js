const Web3 = require('web3');
const rollups_jsonInterface = require("./public/ABI/RollupsImpl_ABI.json")
const input_jsonInterface = require("./public/ABI/InputImpl_ABI.json")

const provider = "http://localhost:8545" // node running Hardhat
const web3 = new Web3(Web3.givenProvider || provider);

//web3.eth.defaultAccount = ... // to set a default "from" parameter
web3.eth.getAccounts().then(console.log).catch(function(error) {console.log("Error: Couldn't get accounts list!")});

const rollups_contract_addr = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"
const rollups_contract = new web3.eth.Contract(rollups_jsonInterface, rollups_contract_addr)

//console.log(rollups_contract)

rollups_contract.methods.getInputAddress().call({ from: "0xcd3b766ccdd6ae721141f452c550ca635964ce71" }).then(
    function(result) {
        const input_contract_addr = result
        //console.log("Input Contract Address: " + input_contract_addr)

        const input_contract = new web3.eth.Contract(input_jsonInterface, input_contract_addr)

        input_contract.methods.addInput("0x636172746573690D0A").call({ from: "0xcd3b766ccdd6ae721141f452c550ca635964ce71" }).then(
            function(result) {
                console.log("Add Input Result: " + result)
            }
        ).catch(function(error) { console.log("Error: Couldn't execute Input contract method.")} )
    }
).catch(function(error) { console.log("Error: Couldn't get Input contract address!")} )

