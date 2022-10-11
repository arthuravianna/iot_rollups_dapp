#!/bin/bash

# Script to run the fron-end (local)


# copy localhost's (hardhat) ABI to public/ABI directory
docker cp iot_rollups_dapp-hardhat-1:/opt/cartesi/share/blockchain/localhost.json ./public/ABI/

# rename
mv ./public/ABI/localhost.json ./public/ABI/blockchain.json

# get dapp.address
cp ../deployments/localhost/dapp.address ./public/deployments

# rsync -r ../deployments public/
if [ $? != 0 ]
then
    echo "Error: Must run Back-End first"
    exit 1
fi


# run the web server
node app.js