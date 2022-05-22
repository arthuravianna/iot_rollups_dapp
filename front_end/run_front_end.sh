#!/bin/bash

# create ABI directory
mkdir public/ABI

# copy localhost's (hardhat) ABI to public/ABI directory
docker cp iot_rollups_dapp_hardhat_1:/opt/cartesi/share/blockchain/localhost.json ./public/ABI/
if [ $? != 0 ]
then
    echo "Error: Must run Back-End first"
    exit 1
fi


# run the web server
node app.js