This is a demo app to demonstrate how to consume OT2 services.

## Prerequisites
NodeJs version 14.2.0


## Installation steps

### Download and install npm and Node.js

Download and install npm and Node.js from https://www.npmjs.com/get-npm

### Setup environment variables

Create a `.env` file in `backend` directory (`backend/.env`) and adjust the below parameters.

```
BASE_URL=<apigee_host>

TENANT_ID=<tenant_id>

CLIENT_ID=<client_id>

CLIENT_SECRET=<client_secret>
```

### Run

Open a command prompt and run the command for your OS from the project root.

*nix. Please note you might need to add execution permissions by running `chmod +x run.sh`
```
./run.sh
```

Windows.
```
run.bat
```

Site will be automatically opened in the browser at http://localhost:3000
