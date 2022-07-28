function loadFileContent(){
    var fileToLoad = document.getElementById("scheduleFile").files[0];

    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent){
        textFromFileLoaded = fileLoadedEvent.target.result;
        //console.log(textFromFileLoaded)
    };

    fileReader.readAsText(fileToLoad, "UTF-8");
}

function do_json_submit(body, is_async) {
    if (is_async == undefined) { is_async = true }

    $.ajax({
        url:"/submit",
        type: "POST",
        async: is_async,
        data: body,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache : false,
        success : function (res) {
            if(res["success"]){
                alert(res["result"]);
            }
            else if (!res["success"]) {
                alert(res["result"])
            }
        },
        error : function () {
            // some error handling part
            alert("Request Failed");
        }
    });
}

async function scheduleSubmit() {
    let input

    if (textFromFileLoaded) {
        try {
            input = JSON.parse(textFromFileLoaded)
        }
        catch (error) {
            alert(error)
            return
        }
    }

    if (!input) {
        alert("Error: Nothing to send.")
        return
    }

    try {
        await metamask_connect()
    }
    catch (e) {
        alert(e)
        return
    }

    input.new_schedule = true // must add to Cartesi Machine's back-end
    input = JSON.stringify(input)
    metamask_send(input)

    // hide modal window
    let myModalEl = document.getElementById('scheduleModal')
    let modal = bootstrap.Modal.getInstance(myModalEl) // Returns a Bootstrap modal instance
    modal.toggle()
};

async function fineSubmit() {
    let input = {}
    input.bus_id = document.getElementById('fineModalBusId').value
    input.trip_id = document.getElementById('fineModalTripId').value
    input.ts = document.getElementById('fineModalTimestamp').value
    input.lat = parseFloat(document.getElementById('fineModalLat').value)
    input.lon = parseFloat(document.getElementById('fineModalLng').value)

    try {
        await metamask_connect()
    }
    catch (e) {
        alert(e)
        return
    }

    input = JSON.stringify(input)
    metamask_send(input)

    // hide modal window
    let myModalEl = document.getElementById('fineModal')
    let modal = bootstrap.Modal.getInstance(myModalEl) // Returns a Bootstrap modal instance
    modal.toggle()
}

function query_chart_data(epoch, select, callback) {
    let body = JSON.stringify({"epoch": epoch,"select": select})


    return $.ajax({
        url:"/query",
        type: "POST",
        //async: false,
        data: body,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache : false,
        success : callback,
        error : function () {
            alert("Request Failed");
        }
    });
}

// METAMASK HANDLING
function handle_accounts(accounts) {
    if (accounts.length === 0) {
        // MetaMask is locked or the user has not connected any accounts
        throw 'Please connect to MetaMask.'
    }
    user_account = accounts[0]
}

function handle_chainid(chainId) {
    if (chainId != back_end_chainid) {
        console.log(`New chainID: ${chainId}`)
        throw `Set Metamask's Network to the one with ID: ${back_end_chainid}`
    }
}

async function metamask_connect() {
    if (typeof window.ethereum === 'undefined') {
        throw "Please Install Metamask to use the application."
    }
    if (await window.ethereum.request({ method: 'eth_chainId' }) != back_end_chainid) {
        throw `Set Metamask Network to the one with ID: ${back_end_chainid}`
    }
    if (!user_account) {
        let accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        handle_accounts(accounts)
    }
    if (!web3) {
        web3 = new Web3(Web3.givenProvider)
        input_contract = new web3.eth.Contract(metamask_conn_config.abi, metamask_conn_config.address)
    }
}

async function metamask_send(input) {
    let input_hex = web3.utils.utf8ToHex(input)
    input_contract.methods.addInput(input_hex).send({ from: user_account })
    .then(console.log)
    .catch(console.log)
}

if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('chainChanged', (chainid) => {
        try { 
            handle_chainid(chainid)
        }
        catch (e) {
            alert(e)
        }
    });
    
    window.ethereum.on('accountsChanged', handle_accounts);

    window.ethereum.on('disconnect', () => { user_account = null })
}

// prevents page from reloading
$( "#schedule-btn-submit" ).click(function( event ) {
    event.preventDefault();
})

// prevents page from reloading
$( "#fine-btn-submit" ).click(function( event ) {
    event.preventDefault();
})
