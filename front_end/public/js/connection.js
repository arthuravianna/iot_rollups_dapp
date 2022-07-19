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

function scheduleSubmit() {
    //const fromAddress = document.getElementById("selectedAddress").value
    let body = undefined

    // if (fromAddress == "") {
    //     alert("Error: Please select an Address.")
    //     return
    // }

    if (textFromFileLoaded) {
        try {
            let json = JSON.parse(textFromFileLoaded)
            body = JSON.stringify(json)
        }
        catch (error) {
            alert(error)
            return
        }
    }

    if (!body) {
        alert("Error: Nothing to send.")
        return
    }

    do_json_submit(body, false)

    // hide modal window
    let myModalEl = document.getElementById('scheduleModal')
    let modal = bootstrap.Modal.getInstance(myModalEl) // Returns a Bootstrap modal instance
    modal.toggle()
};

function fineSubmit() {
    let body = {}
    body.bus_id = document.getElementById('fineModalBusId').value
    body.trip_id = document.getElementById('fineModalTripId').value
    body.ts = document.getElementById('fineModalTimestamp').value
    body.lat = parseFloat(document.getElementById('fineModalLat').value)
    body.lon = parseFloat(document.getElementById('fineModalLng').value)

    body = JSON.stringify(body)

    do_json_submit(body, false)

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

// prevents page from reloading
$( "#schedule-btn-submit" ).click(function( event ) {
    event.preventDefault();
})

// prevents page from reloading
$( "#fine-btn-submit" ).click(function( event ) {
    event.preventDefault();
})