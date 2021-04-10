const express = require("express");
const session = require("express-session");
const request = require("request");
const cors = require('cors');
const fileUpload = require("express-fileupload");
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
app.use(cors({
  origin: [
    'http://localhost:3000'
  ],
  credentials: true,
  exposedHeaders: ['set-cookie']
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

app.use((req, res, next) => {
  if (req.cookies.session_id && !req.session.user) {
    res.clearCookie('session_id');
  }
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

app.get("/api/tasks", async (req, res) => {
  try {
    let responseBody = await tasksGetObjects(req, getAuthorizationWithToken(req));
    res.send(responseBody);
  } catch (err) {
    res.status(err.status).send(err.description);
  }
});

app.post("/api/tasks/:task_id", async (req, res) => {
  try {
    let responseBody = await tasksUpdate(req, req.params.task_id, getAuthorizationWithToken(req));
    res.send(responseBody);
  } catch (err) {
    res.status(err.status).send(err.description);
  }
});

app.get("/api/cms/instances/:category/:type", async (req, res) => {
  try {
    let responseBody = await cmsGetObjects(req, req.params.category, req.params.type, getAuthorizationWithToken(req));
    res.send(responseBody);
  } catch (err) {
    res.status(err.status).send(err.description);
  }
});

app.get("/api/cms/instances/:category/:type/:instanceId/contents", async (req, res) => {
  try {
    let responseBody = await cmsGetInstanceRenditions(req, req.params.category, req.params.type, req.params.instanceId, getAuthorizationWithToken(req));
    res.send(responseBody);
  } catch (err) {
    res.status(err.status).send(err.description);
  }
});

app.post("/api/cms/instances/:category/:type", async (req, res) => {
  try {
    let responseBody = await cmsCreateInstance(req, req.params.category, req.params.type, getAuthorizationWithToken(req));
    res.send(responseBody);
  } catch (err) {
    res.status(err.status).send(err.description);
  }
});

app.post("/api/workflow/createinstance", async (req, res) => {
  try {
    let responseBody = await workflowCreateInstance(req, getAuthorizationWithToken(req));
    res.send(responseBody);
  } catch (err) {
    res.status(err.status).send(err.description);
  }
});

app.get("/api/css/downloadcontent/:contentId/download", async (req, res) => {
  try {
    let responseBody = await cssDownloadContent(req, req.params.contentId, getAuthorizationWithToken(req));
    res.send(responseBody.data);
  } catch (err) {
    res.status(err.status).send(err.description);
  }
});

app.post("/api/css/uploadcontent", async (req, res) => {
  try {
    let responseBody = await cssUploadContent(req, getAuthorizationWithToken(req));
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
