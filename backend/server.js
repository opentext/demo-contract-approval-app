const express = require("express");
const session = require("express-session");
const request = require("request");
const fileUpload = require("express-fileupload");
const replace = require('replace-in-file');
const fs = require('fs')

const { tasksGetObjects, tasksUpdate } = require("./services/Tasks");
const { cmsGetObjects, cmsCreateInstance } = require("./services/CMS");
const { cssDownloadContent, cssUploadContent } = require("./services/CSS");
const { workflowCreateInstance } = require("./services/Workflow");

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const app = express();
require("dotenv").config();

app.set("port", process.env.PORT || 3001);
app.use(cookieParser());
app.use(session({
  key: 'session_id',
  secret: 'my secret string',
  resave: false,
  unset: 'destroy',
  saveUninitialized: true,
  cookie: {
    maxAge: 20 * 60 * 1000 // 20 minutes session timeout
  }
}));

app.disable('x-powered-by');

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("./static"));
}
app.use(bodyParser.json());
app.use(fileUpload());

const displayConfig = !process.argv.includes('--no-config-allowed');

/**
 * Returns the Authorization header
 */
const getAuthorizationWithToken = () => {
  return `Bearer ` + app.get("access_token");
}

/**
 * Saves the OT2 configuration to a file and to the environment.
 */
const saveConfiguration = async configuration => {
  const file = '.env';
  let newFile = false;
  try {
    fs.accessSync(file, fs.F_OK);
  } catch (error) {
    // File does not exist
    newFile = true;
    fs.closeSync(fs.openSync(file, 'w'));
    console.log(`File ${file} created`);
  }
  try {
    if (newFile) {
      // Appending configuration to new .env file
      let stream = fs.createWriteStream(file, {flags:'a'});
      stream.write( 'BASE_URL=https://api.developer.opentext.com\n');
      stream.write( `TENANT_ID=${configuration.tenantId}\n`);
      stream.write( `CLIENT_ID=${configuration.client_id}\n`);
      stream.write( `CLIENT_SECRET=${configuration.client_secret}\n`);
      stream.end();
    } else {
      // Replacing configuration in .env file
      const results = await replace({
        files: file,
        from: [
            /TENANT_ID=.*/g,
            /CLIENT_ID=.*/g,
            /CLIENT_SECRET=.*/g
        ],
        to: [
            `TENANT_ID=${configuration.tenantId}`,
            `CLIENT_ID=${configuration.client_id}`,
            `CLIENT_SECRET=${configuration.client_secret}`
        ]
      });
      if (!results[0].hasChanged) {
        console.log('Configuration file is already up-to-date');
      } else {
        console.log('Configuration file updated');
      }
    }
  }
  catch (error) {
    console.error('Error occurred while processing configuration:', error);
  } finally {
    process.env.CLIENT_ID = configuration.client_id;
    process.env.CLIENT_SECRET = configuration.client_secret;
    process.env.TENANT_ID = configuration.tenantId;
    process.env.BASE_URL = 'https://api.developer.opentext.com';
  }
}

/**
 * This will log all requests to the console for testing purposes.
 */
app.use(async (req, res, next) => {
  if (req.cookies.session_id && !req.session.user) {
    res.clearCookie('session_id');
  }
  console.log('Request received to ' + req.path);
  next();
});

/**
 * Gets the session user.
 * @returns the session user if any otherwise a 204 status code.
 */
app.get("/session", async (req, res) => {
  if (req.session.user && req.cookies.session_id) {
    res.send(req.session.user);
  } else {
    res.sendStatus(204);
  }
});

/**
 * Returns whether the UI must display the configuration.
 * @returns 200 status code when the UI must display the configuration options.
 */
app.get("/display-configuration", async (req, res) => {
  if (displayConfig) {
    res.sendStatus(200);
  } else {
    res.sendStatus(403);
  }
});

/**
 * Logs the user out and clears the cookie.
 * @returns a 200 status code
 */
app.post("/logout", async (req, res) => {
  console.log('Logging user out');
  res.clearCookie('session_id');
  res.sendStatus(200);
});

/**
 * Saves the configuration and sets it in the environment.
 * @param e.Request.body the configuration as JSON
 * @returns 200 status code
 */
app.post("/configuration", async (req, res) => {
  if (!displayConfig) {
    res.sendStatus(403);
  } else {
    console.log('Saving configuration...');
    let configuration = req.body;
    await saveConfiguration(configuration);
    res.status(200).send({message: `Configuration saved successfully.`});
  }
});

/**
 * Checks whether there is a configuration set in the server.
 * @returns 200 when there is a configuration, 204 otherwise.
 */
app.get("/configuration", async (req, res) => {
  if (!displayConfig) {
    res.sendStatus(403);
  } else {
    process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.TENANT_ID ? res.sendStatus(200) : res.sendStatus(204);
  }
});

/**
 * Saves the configuration to the .env file based on an ot2_config.json file uploaded.
 * @returns 200 when the configuration was saved successfully
 */
app.put("/configuration", async (req, res) => {
  if (!displayConfig) {
    res.sendStatus(403);
  } else {
    const errorMessage = 'The file does not appear to be valid JSON.';
    try {
      const file = req.files.file;
      console.log(`Processing configuration file ${file.name}...`);
      if (file.mimetype !== "application/json") {
        res.status(400).send(errorMessage);
      }
      const configuration = JSON.parse(file.data);
      await saveConfiguration(configuration);
      console.log('Configuration file processed successfully => ' + JSON.stringify(configuration, null, 2));
      res.status(200).send({message: `Configuration file ${file.name} processed successfully.`});
    } catch (error) {
      console.error(errorMessage, error);
      res.status(400).send(errorMessage);
    }
  }
});

/**
 * Gets the list of tasks from the Workflow service.
 */
app.get("/api/tasks", async (req, res) => {
  try {
    let responseBody = await tasksGetObjects(req, getAuthorizationWithToken());
    res.send(responseBody);
  } catch (err) {
    res.status(err.status).send(err.description);
  }
});

/**
 * Updates a task in the Workflow service based on the parameters passed in the body as JSON.
 */
app.post("/api/tasks/:task_id", async (req, res) => {
  try {
    let responseBody = await tasksUpdate(req, req.params.task_id, getAuthorizationWithToken());
    res.send(responseBody);
  } catch (err) {
    res.status(err.status).send(err.description);
  }
});

/**
 * Gets the contract metadata from the OT2 Content Metadata service.
 */
app.get("/api/cms/instances/:category/:type", async (req, res) => {
  try {
    let responseBody = await cmsGetObjects(req, req.params.category, req.params.type, getAuthorizationWithToken());
    res.send(responseBody);
  } catch (err) {
    res.status(err.status).send(err.description);
  }
});

/**
 * Links a file uploaded to the OT2 Content Storage service to a contract in the OT2 Content Metadata service.
 */
app.post("/api/cms/instances/:category/:type", async (req, res) => {
  try {
    let responseBody = await cmsCreateInstance(req, req.params.category, req.params.type, getAuthorizationWithToken());
    res.send(responseBody);
  } catch (err) {
    res.status(err.status).send(err.description);
  }
});

/**
 * Creates a new instance of a workflow in the Workflow service which in this context will request a contract approval.
 */
app.post("/api/workflow/createinstance", async (req, res) => {
  try {
    let responseBody = await workflowCreateInstance(req, getAuthorizationWithToken());
    res.send(responseBody);
  } catch (err) {
    res.status(err.status).send(err.description);
  }
});

/**
 * Downloads the contract from the OT2 Content Storage service.
 */
app.get("/api/css/downloadcontent/:contentId/download", async (req, res) => {
  try {
    let responseBody = await cssDownloadContent(req, req.params.contentId, getAuthorizationWithToken());
    res.send(responseBody.data);
  } catch (err) {
    res.status(err.status).send(err.description);
  }
});

/**
 * Uploads a contract to the OT2 Content Storage service.
 */
app.post("/api/css/uploadcontent", async (req, res) => {
  try {
    let responseBody = await cssUploadContent(req, getAuthorizationWithToken());
    res.send(responseBody.data);
  } catch (err) {
    res.status(err.status).send(err.description);
  }
});

/**
 * Gets an authorization token from OT2.
 */
const getToken = async (req) => {
  const username = req.body.username;
  const password = req.body.password;
  let postRequest = {
    method: "post",
    url: process.env.BASE_URL + "/oauth2/token",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      username: username,
      password: password,
      grant_type: "password"
    }),
  };

  return new Promise((resolve, reject) => {
    request(postRequest, (error, response) => {
      if (error) {
        console.log('Authentication with ot2 failed, error: ' + error);
        return reject({status: response ? response.statusCode : error.code, description: error.message ? error.message : error});
      }
      if (response.statusCode !== 200) {
        let responseBody = JSON.parse(response.body);
        console.log('Authentication with ot2 failed: ', responseBody);
        return reject({ status: response.statusCode, description: responseBody.error_description });
      }
      req.session.user = {
        email: username
      };
      resolve(response);
    });
  });
};

/**
 * Requests and sets an access token.
 */
app.post("/api/token", async (req, res) => {
  try {
    let responseBody = await getToken(req);
    let response = JSON.parse(responseBody.body);
    app.set("access_token", response.access_token);
    res.sendStatus(200);
  } catch (err) {
    console.log('Error getting token. Error: ' + JSON.stringify(err));
    const errorMessage = isNaN(err.status) ? err.status + ' ' + err.description : err.description;
    res.status(isNaN(err.status) ? 500 : err.status).send(errorMessage);
  }
});

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});
