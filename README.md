## Prerequisites
use npm v14.2.0


## Installation steps

### Download and install npm and Node.js

Download and install npm and Node.js from https://www.npmjs.com/get-npm

### Setup environment variables

Open the file 'backend/.env' and adjust the below parameters.

BASE_URL=<apigee_host>
TENANT_ID=<tenant_id>
CLIENT_ID=<client_id>
CLIENT_SECRET=<client_secret>
MANAGER_GROUP=<group>

### Run

Open a command prompt and run the following command from project root,

```
cd contract-signing-demo-app
./setup.sh
```

Site will be automatically opened in the browser at http://localhost:3000