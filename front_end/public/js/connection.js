function loadFileContent(){
    var fileToLoad = document.getElementById("scheduleFile").files[0];

    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent){
        textFromFileLoaded = fileLoadedEvent.target.result;
        //console.log(textFromFileLoaded)
    };

    fileReader.readAsText(fileToLoad, "UTF-8");
}


function formSubmit() {
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

    $.ajax({
        url:"/submit",
        type: "POST",
        async: false,
        data: body,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        // data : {
        //     fromAddress: document.getElementById("selectedAddress").value,
        //     data: body
        // },
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

    // hide modal window
    let myModalEl = document.getElementById('scheduleModal')
    let modal = bootstrap.Modal.getInstance(myModalEl) // Returns a Bootstrap modal instance
    modal.toggle()
};


// prevents page from reloading
$( "#schedule-btn-submit" ).click(function( event ) {
    event.preventDefault();
})