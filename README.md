Contract Approval Demo Application
--------

This is a demo application to demonstrate how to consume the IM services from the OpenText Cloud Platform.

## Install Visual Studio Code

Install VS Code from the following URL: https://code.visualstudio.com/download

## Install the OpenText Thrust Studio Extension Pack

From the extensions View in VS Code, install the `OpenText™ Thrust Studio` extension pack.

## Tutorial
We recommend you go through the detailed tutorial (that explains how to build the Contract Approval application). The tutorial is available under `HELP AND FEEDBACK` in the OpenText Cloud Developer Tools view (Ot icon in the VS Code Activity Bar) or via this link: https://mimage.opentext.com/ot/2/devx/vscode/latest/vscode-tutorial.pdf.
Although highly recommended, in case you don't want to go through the tutorial (yet), you can alternatively proceed with the below steps.

## Configure Organization Profile

To allow deploying the application to your developer organization in the OpenText Cloud Platform, add an organization profile as described in the user guide. The user guide is available under `HELP AND FEEDBACK` in the OpenText Cloud Developer Tools view (Ot icon in the VS Code Activity Bar) or via this link: https://mimage.opentext.com/ot/2/devx/vscode/latest/vscode-userguide.pdf. 

## Deployment

Deploy the application project (cf. user guide).

## Credentials

The API client credentials need to be configured from within the application code. Please replace the placeholders for the tenant id and client public id in the `.env` file with the tenant id and the client public id for the deployed application project (returned when deploying the project to the OpenText Cloud Platform).

## Public Service Client redirect URL
In the Admin Center (organization link available under the Console tab when logged in to developer.opentext.com), navigate to `/[your organization name]/Apps/Contract Approval/Clients` and add `https://localhost:4000` as redirect URL for the Public service client.

## Add user(s) to application groups
To be able to fully test the application, you need a user in the line_managers and risk_managers groups. You can optionally also add a user in the administrators and/or contract_approval_users groups. For basic testing, you could also just add one single user to both the line_managers and risk_managers groups, which will result in showing both the Line Manager and Risk Manager tasks tabs in the application. This allows the single user to approve/reject as both Line Manager and Risk Manager.\
\
To add a user to an application group, proceed as follows:\
In the Admin Center, navigate to `/[your organization name]/Tenants/[your tenant name]/Apps/Contract Approval` and select `Groups` from the `User management` section. Edit both the `line_managers` and `risk_managers` groups to add your user(s). 
  
## Download and install Node.js

Download and install Node.js (with npm) from https://nodejs.org/en/download

## Running the application

To run the application using Node.js follow these steps.

Open a terminal in VS Code and run the following commands (from the project root).

```
npm install
npm start
```

The application will be automatically opened in the browser at https://localhost:4000
