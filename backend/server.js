const express = require("express");
const session = require("express-session");
const request = require("request");
const fileUpload = require("express-fileupload");
const replace = require('replace-in-file');
const fs = require('fs')

const { tasksGetObjects, tasksUpdate } = require("./services/Tasks");
const { cmsGetObjects, cmsGetInstanceRenditions, cmsCreateInstance } = require("./services/CMS");
const { cssDownloadContent, cssUploadContent } = require("./services/CSS");
const { workflowCreateInstance } = require("./services/Workflow");

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const app = express();
require("dotenv").config();

app.set("port", process.env.PORT || 3001);
app.use(cookieParser())
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

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}
app.use(bodyParser.json());
app.use(fileUpload());

const getAuthorizationWithToken = () => {
  return `Bearer ` + app.get("access_token");
}

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

app.get("/session", async (req, res) => {
  if (req.session.user && req.cookies.session_id) {
    res.send(req.session.user);
  } else {
    res.sendStatus(204);
  }
});

app.post("/logout", async (req, res) => {
  console.log('Logging user out');
  res.clearCookie('session_id');
  res.sendStatus(200);
});

app.post("/configuration", async (req, res) => {
  console.log('Setting configuration');
  let configuration = req.body;
  await saveConfiguration(configuration);
  res.status(200).send({message: `Configuration processed successfully.`});
});

app.get("/configuration", async (req, res) => {
  process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.TENANT_ID ? res.sendStatus(200) : res.sendStatus(204);
});

app.put("/configuration", async (req, res) => {
  let errorMessage = 'The file does not appear to be valid JSON.';
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
});

app.get("/api/tasks", async (req, res) => {
  try {
    let responseBody = await tasksGetObjects(req, getAuthorizationWithToken());
    res.send(responseBody);
  } catch (err) {
    res.status(err.status).send(err.description);
  }
});

app.post("/api/tasks/:task_id", async (req, res) => {
  try {
    let responseBody = await tasksUpdate(req, req.params.task_id, getAuthorizationWithToken());
    res.send(responseBody);
  } catch (err) {
    res.status(err.status).send(err.description);
  }
});

app.get("/api/cms/instances/:category/:type", async (req, res) => {
  try {
    let responseBody = await cmsGetObjects(req, req.params.category, req.params.type, getAuthorizationWithToken());
    res.send(responseBody);
  } catch (err) {
    res.status(err.status).send(err.description);
  }
});

app.get("/api/cms/instances/:category/:type/:instanceId/contents", async (req, res) => {
  try {
    let responseBody = await cmsGetInstanceRenditions(req, req.params.category, req.params.type, req.params.instanceId, getAuthorizationWithToken());
    res.send(responseBody);
  } catch (err) {
    res.status(err.status).send(err.description);
  }
});

app.post("/api/cms/instances/:category/:type", async (req, res) => {
  try {
    let responseBody = await cmsCreateInstance(req, req.params.category, req.params.type, getAuthorizationWithToken());
    res.send(responseBody);
  } catch (err) {
    res.status(err.status).send(err.description);
  }
});

app.post("/api/workflow/createinstance", async (req, res) => {
  try {
    let responseBody = await workflowCreateInstance(req, getAuthorizationWithToken());
    res.send(responseBody);
  } catch (err) {
    res.status(err.status).send(err.description);
  }
});

app.get("/api/css/downloadcontent/:contentId/download", async (req, res) => {
  try {
    let responseBody = await cssDownloadContent(req, req.params.contentId, getAuthorizationWithToken());
    res.send(responseBody.data);
  } catch (err) {
    res.status(err.status).send(err.description);
  }
});

app.post("/api/css/uploadcontent", async (req, res) => {
  try {
    let responseBody = await cssUploadContent(req, getAuthorizationWithToken());
    res.send(responseBody.data);
  } catch (err) {
    res.status(err.status).send(err.description);
  }
});

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
        return reject({ status: response.statusCode, description: error });
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

app.post("/api/token", async (req, res) => {
  try {
    let responseBody = await getToken(req);
    let response = JSON.parse(responseBody.body);
    app.set("access_token", response.access_token);
    res.sendStatus(200);
  } catch (err) {
    console.log('Error getting token. Error: ' + JSON.stringify(err));
    res.status(err.status).send(err.description);
  }

});
app.post("/api/cleartoken", async (req, res) => {
  app.set("access_token", "");
});

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});
