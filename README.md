IMaaS Contract Approval Demo Application
--------

This is a demo application to demonstrate how to consume IMaaS services.

## Prerequisites
NodeJs version >= 14.2.0 and < 15 

## Credentials

The credentials can be configured from inside the running application. In the login dialog there is a wrench icon that 
allows to manually configure the credentials. Bear in mind that once entered, the details cannot be recovered for
security reasons.
  
## Installation steps

### Download and install npm and Node.js

Download and install npm and Node.js from https://www.npmjs.com/get-npm

## Running the application

### Node.js

Tu run the application natively using Node.js follow these steps.

Open a command prompt and run the command for your OS from the project root.

*nix. Please note you might need to add execution permissions by running `chmod +x run.sh`
```
./run.sh
```

Windows.
```
run.bat
```

The application will be automatically opened in the browser at http://localhost:3000

### Docker

The application can be run as a Docker container. For that, the container needs to be built and then run.

#### Building the container

Run the following command from the project root to build the container.

```
docker build . --tag contract-approval-demo
```

#### Running the container

Run the following command to launch the application container at port 3000. The application always launches in the port
 3001 inside the container, but you can bind any port to it. In the example below, the local port 3000 is bound to the
container internal port 3001.

```
docker run --name lab01 -p 3000:3001 -d contract-approval-demo
```

To open the application browse to http://localhost:3000
