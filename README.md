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
The DApp front-end consists of an Web server developed in NodeJS, it's objective is to insteract with Cartesis's contracts in the Blockchain (Layer-1), and for that it uses the Web3.js module.

The server runs on port `3000` and has 3 routes:
- `/` : Dashboard containing info about the fines to be paid. To retrive this information the Web Server makes queries to the graphql server running on port `4000`. Each page of the dashboard has data of an different epoch;
- `/form` : A page were an user can upload a bus line schedule. The bus line schedule should be stored in a JSON file and should follow the same format of the files in the `front_end/data_demo` directory;
- `/submit` : Doesn't have a page, it's the route used to send inputs(real-time GPS data) to the Web server, the Web server will then forward this data to the Contract in the Blockchain and the Contract will forward it to the back-end.

### Installing & Running
``` Bash
cd front_end
npm install
node app.js
```




## Back-End
The DApp back-end consists of the verifiable logic that will run inside Cartesi Rollups; this will store and update the application state given user input, and will produce outputs as vouchers (transactions that can be carried out on Layer1) and notices (informational). **The current version only uses notices**.


### Production Mode
To execute the back-end in production mode it's necessary to generate an cartesi machine that contains the back-end logic and then run the production enviroment (containers).

#### Generating Cartesi Machine
``` Bash
make machine
```

#### Running the environment
In order to start the containers in production mode, simply run:
``` Bash
docker-compose up --build
```

#### Stopping the environment
To stop the containers, first end the process with `Ctrl + C`.
Then, remove the containers and associated volumes by executing:
``` Bash
docker-compose down -v
```





### Host Mode
To execute the back-end in host mode it's necessary to run the DApp back-end logic locally and then run the host enviroment (containers).

#### Running the back-end locally
The first step is to run the back-end in your machine. In order to start the server, run the following commands in a dedicated terminal:
``` Bash
cd server
python3 -m venv .env
. .env/bin/activate
pip install -r requirements.txt
HTTP_DISPATCHER_URL="http://127.0.0.1:5004" gunicorn --preload --workers 1 --bind 0.0.0.0:5003 iot_dapp:app
```

The server will run on port `5003` and send the corresponding notices to port `5004`. After that, you can interact with the application normally.

#### Running the environment
In order to start the containers in host mode, simply run:
``` Bash
docker-compose -f docker-compose.yml -f docker-compose-host.yml up --build
```


#### Stopping the environment
Finally, to stop the containers, removing any associated volumes, execute:
``` Bash
docker-compose -f docker-compose.yml -f docker-compose-host.yml down -v
```

## interacting-with-the-application