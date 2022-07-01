# IoT Rollups DApp

## Project Overview
This project uses Cartesi Rollups to build a DApp (Decentralized Application) with verifiable logic. The purpose of this application is to verify verify if a public transportation service is complying with its schedules and routes, if not, the DApp will automatically generate a fine for that bus line.

To be able to do that the DApp only needs to load (once) the schedule of the Public Transport. After that whenever it receives GPS data from one vehicle that has to comply with the loaded schedule it will generate or not a fine.


## Project Requirements
- npm
- nodeJS
- python3
- docker
- docker-compose


## Running the Dapp
To run the DApp is necessary to execute the front-end and the back-end, the later has two modes, Production Mode and Host Mode.

In Production Mode the back-end will run inside the Cartesi Machine, in Host Mode it will run on the local machine, this mode is usefull when developing an application.

After executing the Front-End and **one** of the Back-End modes the user will be able to interact with de DApp the way described [in this section](#interacting-with-the-application).

## Front-End
The DApp front-end consists of a Web server developed in NodeJS, it's objective is to insteract with Cartesis's contracts in the Blockchain (Layer-1), and for that it uses the Web3.js module.

The server runs on port `3000` and has 3 routes:
- `/` : Dashboard containing info about the fines to be paid. To retrive this information the Web Server makes queries to the graphql server running on port `4000`. Each page of the dashboard has data of an different epoch;
- `/form` : A page were an user can upload a bus line schedule. The bus line schedule should be stored in a JSON file and should follow the same format of the files in the `demo/schedules_demo` directory;
- `/submit` : Doesn't have a page, it's the route used to send inputs(real-time GPS data) to the Web server, the Web server will then forward this data to the Contract in the Blockchain and the Contract will forward it to the back-end.

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
docker compose -f docker-compose.yml -f docker-compose.override.yml up
```

#### Stopping the environment
To stop the containers, first end the process with `Ctrl + C`.
Then, remove the containers and associated volumes by executing:
``` Bash
docker compose -f docker-compose.yml -f docker-compose.override.yml down -v
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
Before sending vehicle data, first upload a bus schedule.

### Send Bus Schedule
This operation can be done in two ways, using the interface or direct communication with the web server via ``curl`` command.

#### Web Page
1) Go to page http://localhost:3000/form
2) Select a valid schedule file. (it can be one of the located in "demo/schedules_demo" folder)
3) Press "Submit"

Now the back-end has added that bus line schedule to its database.

#### Via curl command
Execute the curl command bellow.
``` Bash
curl -H "Content-Type: application/json" -d @demo/schedules_demo/schedule1.json http://localhost:3000/submit
```

### Send Vehicle Data
The Vehicle Data doesn't have a page for it, assuming that this operation will be done by IoT devices there won't be need of a web page.

Example 1) Execute the curl command bellow to send data of a vehicle that is out of its route. This vehicle is of bus line "18C" described in "schedule1.json".

``` Bash
curl -H "Content-Type: application/json" -d '{"bus_id": "18C", "trip_id":"18C;1","lat": 57.828261, "lon": 26.535419,"ts": "2022-03-25 07:45:50" }' http://localhost:3000/submit
```

Example 2) Execute the curl command bellow to send data of a vehicle that is late. This vehicle is of bus line "18C" described in "schedule1.json".
``` Bash
curl -H "Content-Type: application/json" -d '{"bus_id": "18C", "trip_id":"18C;1", "lat": 57.82847892, "lon": 26.53362055,"ts": "2022-05-04 07:48:30"}' http://localhost:3000/submit
```