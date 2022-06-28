#!/bin/bash

# Test Script to Populate the DApp with several fines

if [ $# != 1 ]
then
    echo "Missing argument: <number of inputs for each epoch>"
    exit 0
fi

INPUTS=$1

# Epoch 0
python3 populate.py ${INPUTS}

# Advancing Time (Epoch 0 -> 1)
docker exec iot_rollups_dapp_hardhat_1 npx hardhat --network localhost util:advanceTime --seconds 864010

# Epoch 1
python3 populate.py ${INPUTS}

# Advancing Time (Epoch 1 -> 2)
docker exec iot_rollups_dapp_hardhat_1 npx hardhat --network localhost util:advanceTime --seconds 864010

# Epoch 2
python3 populate.py ${INPUTS}
