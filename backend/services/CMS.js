const request = require("request");
require("dotenv").config();

const cmsGetObjects = async (req, category, type, authorization) => {
  let getRequest = {
    method: "get",
    url: process.env.BASE_URL + '/cms/instances/' + category + '/' + type + req.originalUrl.replace(/[^?]*/, ""),
    headers: {
      'Authorization': authorization
    }
  };

  return new Promise((resolve, reject) => {
    request(getRequest, (error, response) => {
      if (error) throw new Error("Error in receiving cms objects: " + error);
      if (response.statusCode !== 200) {
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
}

const cmsCreateInstance = async (req, category, type, authorization) => {
  let postRequest = {
    method: "post",
    url: process.env.BASE_URL + '/cms/instances/' + category + '/' + type + req.originalUrl.replace(/[^?]*/, ""),
    headers: {
      'Authorization': authorization
    },
    json: req.body
  };

  return new Promise((resolve, reject) => {
    request(postRequest, (error, response) => {
      if (error) throw new Error("Error in creating cms instance: " + error);
      if (!String(response.statusCode).startsWith('2')) {
        console.log('Request failed: ', response.statusCode, response.body);
        let errorDescription;
        if (response.body) {
          if (response.body.details) {
            errorDescription = response.body.details;
          }
          if (response.body.fault) {
            errorDescription = response.body.faultstring;
          }
        }
        return reject({
          status: response.statusCode,
          description: errorDescription
        });
      }
      resolve(response.body);
    });
  });
}

module.exports = {
  cmsGetObjects,
  cmsCreateInstance
};
