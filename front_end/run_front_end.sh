#!/bin/bash

# copy localhost's (hardhat) ABI to public/ABI directory
#docker cp iot_rollups_dapp-hardhat-1:/opt/cartesi/share/blockchain/localhost.json ./public/ABI/
#cp -r ../back_end/deployments ./public/

rsync -r ../deployments public/
if [ $? != 0 ]
then
    echo "Error: Must run Back-End first"
    exit 1
fi


# run the web server
node app.js