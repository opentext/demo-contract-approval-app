const request = require("request");
require("dotenv").config();

const workflowCreateInstance = async (req, authorization) => {
  if (req.body.variables) {
    req.body.variables.push(
      { name: 'tenant_id', value: process.env.TENANT_ID },
      { name: 'client_id', value: process.env.CLIENT_ID },
      { name: 'client_secret', value: process.env.CLIENT_SECRET }
    );
  }

  let postRequest = {
    method: "post",
    url: process.env.BASE_URL + '/workflow/v1/process-instances' + req.originalUrl.replace(/[^?]*/, ""),
    headers: {
      "Content-Type": "application/json",
      'Authorization': authorization
    },
    json: req.body
  };

  return new Promise((resolve, reject) => {
    request(postRequest, (error, response) => {
      if (error) throw new Error("Error creating workflow instance: " + error);
      if (response.statusCode !== 200 && response.statusCode !== 201) {
        console.log('Request failed: ', response.body);
        return reject({
          status: response.statusCode,
          description: response.body != null && response.body.fault != null ? response.body.fault.faultstring : response.body
        });
      }
      resolve(response.body);
    });
  });
}

module.exports = {
  workflowCreateInstance
};
