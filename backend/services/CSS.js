const axios = require("axios");
const FormData = require('form-data');
require("dotenv").config();

const cssDownloadContent = async (req, contentId, authorization) => {
  let getRequest = {
    method: 'get',
    url: process.env.BASE_URL + '/css/v2/content/' + contentId + "/download" + req.originalUrl.replace(/[^?]*/, ""),
    headers: {
      'Authorization': authorization,
      'Content-Type': 'application/json',
    },
    responseEncoding: 'binary',
    responseType: 'arraybuffer'
  };

  return new Promise((resolve, reject) => {
    axios(getRequest).then((getResponse) => {
      resolve(getResponse);
    }).catch((response) => {
      reject(response.response);
    });
  });
}

const cssUploadContent = async (req, authorization) => {
  let form = new FormData();
  form.append('file', req.files.file.data, req.files.file.name);
  let postRequest = {
    method: "post",
    url: process.env.BASE_URL + '/css/v2/tenant/' + process.env.TENANT_ID + '/content' + req.originalUrl.replace(/[^?]*/, ""),
    data: form,
    headers: {
      'Authorization': authorization,
      ...form.getHeaders(),
    },
  };

  return new Promise((resolve, reject) => {
    axios(postRequest).then((postResponse) => {
      resolve(postResponse);
    }).catch(response => {
      reject(response.response);
    });
  });
}

module.exports = {
  cssDownloadContent,
  cssUploadContent
};
