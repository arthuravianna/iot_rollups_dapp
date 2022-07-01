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
curl --data '{"id":1337,"jsonrpc":"2.0","method":"evm_increaseTime","params":[864010]}' http://localhost:8545

# Epoch 1
python3 populate.py ${INPUTS}

# Advancing Time (Epoch 1 -> 2)
curl --data '{"id":1337,"jsonrpc":"2.0","method":"evm_increaseTime","params":[864010]}' http://localhost:8545

# Epoch 2
python3 populate.py ${INPUTS}
