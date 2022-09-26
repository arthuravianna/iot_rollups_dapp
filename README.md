# IoT Rollups DApp

## Project Overview
This project uses Cartesi Rollups to build a DApp (Decentralized Application) with verifiable logic. The purpose of this application is to verify if a public transportation service is complying with its schedules and routes, if not, the DApp will automatically generate a fine for that bus line.

To be able to do that the DApp only needs to load (once) the schedule of the Public Transport. After that whenever it receives GPS data from one vehicle that has to comply with the loaded schedule it will generate or not a fine.


## Project Requirements
- npm
- nodeJS
- python3
- docker (version >= 20.10.12)
- metamask (browser extension)


## Running the Dapp
To run the DApp is necessary to execute the front-end and the back-end, the later has two modes, Production Mode and Host Mode.

In Production Mode the back-end will run inside the Cartesi Machine, in Host Mode it will run on the local machine, this mode is usefull when developing an application.

After executing the Front-End and **one** of the Back-End modes the user will be able to interact with de DApp [using Metamask](#interacting-using-Metamask) or [using the curl command](#interacting-using-curl).

## Front-End
The DApp front-end consists of a Web server developed in NodeJS, it's objective is to insteract with Cartesis's contracts in the Blockchain (Layer-1), and for that it uses the Web3.js module.

The server runs on port `3000` and has 4 routes:
- `/` : Dashboard containing info about the fines to be paid. To retrive this information the Web Server makes queries to the graphql server running on port `4000`. Each page of the dashboard has data of an different epoch;
- `/submit` : Doesn't have a page, it's the route used to send inputs(real-time GPS data or a schedules) to the Web server, the Web server will then forward this data to the Contract in the Blockchain and the Contract will forward it to the back-end. **This route uses a default hardhat account and is ideal for tests.**
- `/inspect` : Used to access the inspect state of the Cartesi Machine. In this app this feature is used to get information stored in the Database (SQLite) inside the Cartesi Machine, like the know bus lines or the route of a bus line.
- `/query` : Used to query emitted fines information in form of Histogram or Time Series.

### Installing & Running
``` Bash
cd front_end
npm install
bash run_front_end.sh
```




## Back-End
The DApp back-end consists of the verifiable logic that will run inside Cartesi Rollups; this will store and update the application state given user input, and will produce outputs as vouchers (transactions that can be carried out on Layer1) and notices (informational). **The current version only uses notices**.

### Building
To build the application, run the following command:

``` Bash
docker buildx bake -f docker-bake.hcl -f docker-bake.override.hcl --load
```

### Production Mode
To execute the back-end in production mode it's necessary to generate a cartesi machine that contains the back-end logic and then run the production enviroment (containers).


#### Running the environment
In order to start the containers in production mode, simply run:
``` Bash
docker compose up
```

#### Stopping the environment
To stop the containers, first end the process with `Ctrl + C`.
Then, remove the containers and associated volumes by executing:
``` Bash
docker compose down -v
```





### Host Mode
To execute the back-end in host mode it's necessary to run the DApp back-end logic locally and then run the host enviroment (containers).

#### Running the environment
The first step is to start the containers in host mode:
``` Bash
docker compose -f docker-compose.yml -f docker-compose.override.yml -f docker-compose-host.yml up
```

#### Running the back-end locally
The second step is to run the back-end in your machine. In order to start the server, run the following commands in a dedicated terminal:
``` Bash
cd back_end
python3 -m venv .env
. .env/bin/activate
pip install -r requirements.txt
ROLLUP_HTTP_SERVER_URL="http://127.0.0.1:5004" python3 iot_rollups_dapp.py
```

The server will run on port `5003` and send the corresponding notices to port `5004`. After that, you can interact with the application normally.

#### Stopping the environment
To stop the containers, first end the process with `Ctrl + C`.
Then, remove the containers and associated volumes by executing:
``` Bash
docker compose -f docker-compose.yml -f docker-compose.override.yml -f docker-compose-host.yml down -v
```






## Advancing Time
The command bellow advance 1 epoch
``` Bash
curl --data '{"id":1337,"jsonrpc":"2.0","method":"evm_increaseTime","params":[864010]}' http://localhost:8545
```





## interacting-with-the-application
Before sending vehicle data, first upload a bus schedule. These operations can be done using the interface (Metamask) or the curl command to the `/submit` route.

## interacting-using-Metamask
To be able to interact with the DApp using Metamask is necessary to go through the following steps:
1) Install the Metamask extension in the desired browser.
2) Create a wallet.
3) Add the localhost 8545 network. [How to add a network](https://metamask.zendesk.com/hc/en-us/articles/360043227612-How-to-add-a-custom-network-RPC).
4) Import one of the hardhat accounts to metamask (Use one of the private keys bellow). [How to import an Account](https://metamask.zendesk.com/hc/en-us/articles/360015489331-How-to-import-an-Account).

    Account 0: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

    Account 1: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

    Account 2: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

    Account 3: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6

    Account 4: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a

    Account 5: 0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba

    Account 6: 0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e

    Account 7: 0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356

    Account 8: 0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97

    Account 9: 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6

    Account 10: 0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897

    Account 11: 0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82

    Account 12: 0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1

    Account 13: 0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd

    Account 14: 0xc526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa

    Account 15: 0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61

    Account 16: 0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0

    Account 17: 0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd

    Account 18: 0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0

    Account 19: 0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e


### Send Bus Schedule
Click on the upload button, browser through your files and select the desired schedule file, then click "submit". The DApp will ask to connect to metamask first (if it is not connected yet), then will prompt a transaction. Confirm the transaction to send the schedule to the blockchain and it will be fowarded to the Cartesi Machine's back-end.


### Send Vehicle Data
Click anywhere in the map and a modal window with lat and lng information already filled (extracted from the position clicked on map) will be open. Fill the form with the missing informations, then click "submit". Like the bus schedule interaction, the DApp will ask to connect to metamask first (if it is not connected yet), then will prompt a transaction. Confirm the transaction to send the data.

## interacting-using-curl
This form of interaction is used for tests because it uses a "default" hardhat account to cover expenses of the contracts methods execution.


### Send Bus Schedule
Execute the curl command bellow.

``` Bash
curl -H "Content-Type: application/json" -d @demo/schedules_demo/schedule1.json http://localhost:3000/submit
```

### Send Vehicle Data
Execute one of the curl commands bellow.

Example 1) Execute the curl command bellow to send data of a vehicle that is out of its route. This vehicle is of bus line "18C" described in "schedule1.json".

``` Bash
curl -H "Content-Type: application/json" -d '{"bus_id": "18C", "trip_id":"18C;1","lat": 57.828261, "lon": 26.535419,"ts": "2022-03-25 07:45:50" }' http://localhost:3000/submit
```

Example 2) Execute the curl command bellow to send data of a vehicle that is late. This vehicle is of bus line "18C" described in "schedule1.json".

``` Bash
curl -H "Content-Type: application/json" -d '{"bus_id": "18C", "trip_id":"18C;1", "lat": 57.82847892, "lon": 26.53362055,"ts": "2022-05-04 07:48:30"}' http://localhost:3000/submit
```