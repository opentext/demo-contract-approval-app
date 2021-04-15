const request = require("request");
require("dotenv").config();

const tasksGetObjects = async (req, authorization) => {
  let getRequest = {
    method: "get",
    url: process.env.BASE_URL + "/workflow/v1/tasks/" + req.originalUrl.replace(/[^?]*/, ""),
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization
    }
  };

  return new Promise((resolve, reject) => {
    request(getRequest, (error, response) => {
      if (error) throw new Error(error);
      if (!String(response.statusCode).startsWith('2')) {
        let responseBody = JSON.parse(response.body);
        console.log('Request failed: ', responseBody);
        return reject({
          status: response.statusCode,
          description: responseBody != null && responseBody.fault != null ? responseBody.fault.faultstring : responseBody.details
        });
      }
      resolve(response.body);
    });
  });
};

const tasksUpdate = async (req, taskId, authorization) => {
  let postRequest = {
    method: "post",
    url: process.env.BASE_URL + "/workflow/v1/tasks/" + taskId,
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization
    },
    json: req.body
  };

  return new Promise((resolve, reject) => {
    request(postRequest, (error, response) => {
      if (error) throw new Error(error);
      if (response.statusCode !== 200 && response.statusCode !== 204) {
        console.log('Request failed: ', response.body);
        return reject({
          status: response.statusCode,
          description: response.body != null && response.body.fault != null ? response.body.fault.faultstring : response.body
        });
      }
      resolve(response.body);
    });
  });
};

module.exports = {
  tasksGetObjects,
  tasksUpdate
};
