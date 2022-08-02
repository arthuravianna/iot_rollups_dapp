const conn = require("../config/connection.js")
const request = require('request');

module.exports={
    doInspect:async function(data, success, error) {
        const data_hex = conn.web3.utils.utf8ToHex(data)

        let options = {
            url: `${conn.dapp_inspect_url}/${data_hex}`,
        };

        request.get(options, (err, res, body) => {
            if (err) {       
                console.log(err)
                error(err)
                return
            }

            body = JSON.parse(body)
            let payload_str = conn.web3.utils.hexToUtf8(body.reports[0].payload)

            success(JSON.parse(payload_str))
        })
    },
}