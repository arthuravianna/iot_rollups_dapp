const Web3 = require('web3');
const rollups_jsonInterface = require("./ABI/RollupsImpl_ABI.json")
const input_jsonInterface = require("./ABI/InputImpl_ABI.json")

const provider = "http://localhost:8545" // node running Hardhat
const web3 = new Web3(Web3.givenProvider || provider);

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
        )
    }
)



// console.log("*****************************************")
// console.log(web3.givenProvider);
// console.log("*****************************************")

// contract.methods.addInput("0x636172746573690D0A").call({ from: "0xcd3b766ccdd6ae721141f452c550ca635964ce71" }).then(
//     function(result){
//         console.log(result)
//     }
// )

// web3.eth.sendTransaction({from: '0x123...', data: '0x432...'})
// .once('sending', function(payload){ ... })
// .once('sent', function(payload){ ... })
// .once('transactionHash', function(hash){ ... })
// .once('receipt', function(receipt){ ... })
// .on('confirmation', function(confNumber, receipt, latestBlockHash){ ... })
// .on('error', function(error){ ... })
// .then(function(receipt){
//     // will be fired once the receipt is mined
// });