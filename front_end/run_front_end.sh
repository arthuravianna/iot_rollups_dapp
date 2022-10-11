#!/bin/bash

# Script to run the fron-end (local)

mkdir -p ./public/ABI

# copy localhost's (hardhat) ABI to public/ABI directory
docker cp iot_rollups_dapp-hardhat-1:/opt/cartesi/share/blockchain/localhost.json ./public/ABI/
if [ $? != 0 ]
then
    echo "Error: Must run Back-End first"
    exit 1
fi

# get dapp.address
mkdir -p ./public/deployments
cp ../deployments/localhost/dapp.address ./public/deployments

# run the web server
LOCAL_MODE=localhost.json node app.js