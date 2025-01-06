import axios from 'axios';

class RiskGuard {
  constructor(user) {
    this.url = `${process.env.REACT_APP_BASE_SERVICE_URL}/mtm-riskguard/api/v1/process`;
    this.user = user;
  }

  static calculateRisk(response) {
    const extractedSSN = ['**Social Security Numbers:'];
    const extractedCC = ['**Credit Card Numbers:'];
    const extractedBA = ['**Bank Accounts:'];
    const extractedPN = ['**Person Names:'];
    const extractedPhone = ['**Phone Numbers:'];
    const extractedAddress = ['**Addresses:'];
    const extractedGL = ['**Geographic Locations:'];
    const extractedON = ['**Organization Names:'];

    let riskClassification = 1;
    let personNameCount = 0;
    let phoneNumberCount = 0;
    response.data?.results?.tme?.result?.results?.nfinder[0]?.nfExtract[0]?.extractedTerm?.forEach(
      (extractedTerm) => {
        switch (extractedTerm.cartridgeID) {
          case 'PN':
            if (extractedTerm.confidenceScore > 60) {
              if (extractedTerm.nfinderNormalized) {
                extractedPN.push(extractedTerm.nfinderNormalized);
              } else if (extractedTerm.mainTerm.value) {
                extractedPN.push(extractedTerm.mainTerm.value);
              }
              personNameCount += 1;
            }
            break;
          case 'Phone':
            if (extractedTerm.confidenceScore > 60) {
              extractedPhone.push(extractedTerm.nfinderNormalized);
              phoneNumberCount += 1;
            }
            break;
          case 'Address':
            if (extractedTerm.confidenceScore > 60) {
              extractedAddress.push(extractedTerm.nfinderNormalized);
            }
            break;
          case 'GL':
            if (extractedTerm.confidenceScore > 60) {
              extractedGL.push(extractedTerm.mainTerm.value);
            }
            break;
          case 'ON':
            if (extractedTerm.confidenceScore > 60) {
              if (extractedTerm.nfinderNormalized) {
                extractedON.push(extractedTerm.nfinderNormalized);
              } else if (extractedTerm.mainTerm.value) {
                extractedON.push(extractedTerm.mainTerm.value);
              }
            }
            break;
          case 'SSN':
            extractedSSN.push(extractedTerm.clientNormalized);
            if (riskClassification < 5) {
              riskClassification = 5;
            }
            break;
          case 'CreditCard':
            extractedCC.push(extractedTerm.clientNormalized);
            if (riskClassification < 4) {
              riskClassification = 4;
            }
            break;
          case 'BankAccount':
            extractedBA.push(extractedTerm.clientNormalized);
            if (riskClassification < 2) {
              riskClassification = 2;
            }
            break;
          default:
            // Do nothing
        }
        if (riskClassification < 3 && (personNameCount >= 5
          || (personNameCount > 2 && phoneNumberCount > 2))
        ) {
          riskClassification = 3;
        }
      },
    );

    const extractedTerms = [].concat(
      extractedSSN,
      extractedCC,
      extractedBA,
      extractedPN,
      extractedPhone,
      extractedAddress,
      extractedGL,
      extractedON,
    );

    return {
      riskClassification,
      extractedTerms,
    };
  }

  async processDoc(fileData, fileName) {
    const form = new FormData();
    form.append('File', fileData, fileName);
    const postRequest = {
      method: 'post',
      url: this.url,
      headers: {
        Authorization: `Bearer ${this.user.access_token}`,
        'Content-Type': 'multipart/form-data',
      },
      data: form,
    };

    return new Promise((resolve, reject) => {
      axios(postRequest).then((postResponse) => {
        resolve({ data: RiskGuard.calculateRisk(postResponse) });
      }).catch((err) => {
        // eslint-disable-next-line no-console
        console.err(err);
        reject(new Error(err.response));
      });
    });
  }
}

export default RiskGuard;
