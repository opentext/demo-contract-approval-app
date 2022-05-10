import axios from 'axios';

export default class RiskGuard {
  constructor(props) {
    this.props = props;
  }

  async processDoc(fileData, fileName) {
    let form = new FormData();
    form.append('File', fileData, fileName);
    let postRequest = {
      method: "post",
      url: process.env.REACT_APP_BASE_URL + '/mtm-riskguard/api/v1/process',
      headers: {
				'Authorization': this.props.authContext.headers.Authorization,
				'Content-Type': 'multipart/form-data',
			},
      data: form,
    };
  
    return new Promise((resolve, reject) => {
      axios(postRequest).then((postResponse) => {
        resolve({
          data: this.calculateRisk(postResponse)
        });
      }).catch(response => {
        reject(response.response);
      });
    });
  }

  calculateRisk = (rgResponse) => {
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
}
