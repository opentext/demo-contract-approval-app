const axios = require("axios");
const FormData = require('form-data');
require("dotenv").config();
const request = require("request");
const rgGetToken = async () => {
  let postRequest = {
    method: "post",
    url: process.env.BASE_URL + "/tenants/" + process.env.TENANT_ID + "/oauth2/token",
    headers: {
      "Content-Type": "application/json",
      "Auhorization": "Bearer " + process.env.RG_TOKEN_AUTH
    },
    body: JSON.stringify({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "client_credentials"
    }),
  };

  return new Promise((resolve, reject) => {
    request(postRequest, (error, response) => {
      if (error) throw new Error("Error calling Risk Guard: " + error);
      if (response.statusCode !== 200) {
        let responseBody = JSON.parse(response.body);
        console.log('Request failed: ', response.statusCode, response.body);
        return reject({ status: response.statusCode, description: responseBody.error_description });
      }
      let responseBody = JSON.parse(response.body);
      resolve(responseBody.access_token);
    });
  });
};

const rgProcessDoc = async (req, rgToken) => {
  let form = new FormData();
  form.append('File', req.files.file.data, req.files.file.name);
  let postRequest = {
    method: "post",
    url: process.env.BASE_URL + '/mtm-riskguard/api/v1/process',
    headers: {
      'Authorization': "Bearer " + rgToken,
      ...form.getHeaders(),
    },
    data: form,
  };

  return new Promise((resolve, reject) => {
    axios(postRequest).then((postResponse) => {
      resolve({
        data: rgCalculateRisk(postResponse)
      });
    }).catch(response => {
      reject(response.response);
    });
  });
}

const rgCalculateRisk = (rgResponse) => {
  let extractedSSN = ['**Social Security Numbers:'];
  let extractedCC = ['**Credit Card Numbers:'];
  let extractedBA = ['**Bank Accounts:'];
  let extractedPN = ['**Person Names:'];
  let extractedPhone = ['**Phone Numbers:'];
  let extractedAddress = ['**Addresses:'];
  let extractedGL = ['**Geographic Locations:'];
  let extractedON = ['**Organization Names:'];

  let riskClassification = 1;
  let personNameCount = 0;
  let phoneNumberCount = 0;
  rgResponse.data.results.tme.result.Results.nfinder[0].nfExtract[0].ExtractedTerm.forEach(extractedTerm => {
    const cartridgeID = extractedTerm.CartridgeID;

    switch (cartridgeID) {
      case 'PN':
        if (extractedTerm.ConfidenceScore > 60) {
          if (extractedTerm.nfinderNormalized) {
            extractedPN.push(extractedTerm.nfinderNormalized);
          }
          else if (extractedTerm.MainTerm.value) {
            extractedPN.push(extractedTerm.MainTerm.value);
          }
          personNameCount++;
        }
        break;
      case 'Phone':
        if (extractedTerm.ConfidenceScore > 60) {
          extractedPhone.push(extractedTerm.nfinderNormalized);
          phoneNumberCount++;
        }
        break;
      case 'Address':
        if (extractedTerm.ConfidenceScore > 60) {
          extractedAddress.push(extractedTerm.nfinderNormalized);
        }
        break;
      case 'GL':
        if (extractedTerm.ConfidenceScore > 60) {
          extractedGL.push(extractedTerm.MainTerm.value);
        }
        break;
      case 'ON':
        if (extractedTerm.ConfidenceScore > 60) {
          if (extractedTerm.nfinderNormalized) {
            extractedON.push(extractedTerm.nfinderNormalized);
          }
          else if (extractedTerm.MainTerm.value) {
            extractedON.push(extractedTerm.MainTerm.value);
          }
        }
        break;
      case 'SSN':
        extractedSSN.push(extractedTerm.ClientNormalized);
        if (riskClassification < 5) {
          riskClassification = 5;
        }
        break;
      case 'CreditCard':
        extractedCC.push(extractedTerm.ClientNormalized);
        if (riskClassification < 4) {
          riskClassification = 4;
        }
        break;
      case 'BankAccount':
        extractedBA.push(extractedTerm.ClientNormalized);
        if (riskClassification < 2) {
          riskClassification = 2;
        }
        break;
      default:
        // Do nothing
    }
    if (riskClassification < 3 && (personNameCount >= 5 || (personNameCount > 2 && phoneNumberCount > 2))) {
      riskClassification = 3;
    }
  });

  let extractedTerms = [].concat(extractedSSN, extractedCC, extractedBA, extractedPN, extractedPhone, extractedAddress, extractedGL, extractedON);

  return {
    "riskClassification": riskClassification,
    "extractedTerms": extractedTerms
  };
}

module.exports = {
  rgGetToken,
  rgProcessDoc
};
