import { useContext, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useAuth } from 'react-oidc-context';
import {
  Button,
  Backdrop,
  CircularProgress,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  FormControl,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import ApplicationContext from '../context/ApplicationContext';
import RiskGuard from '../services/riskguard/RiskGuard';

const baseUrl = process.env.REACT_APP_BASE_SERVICE_URL;

function AddContract({
  open,
  onAddContract,
  onClose,
}) {
  const { user } = useAuth();
  const { appRootFolderId, updateAppRootFolderId } = useContext(ApplicationContext);
  const [state, setState] = useState(
    {
      showBackdrop: false,
      selectedContract: {
        newContractType: '',
        newContractName: '',
        newContractValue: '',
        newContractRequesterEmail: '',
        newContractMonthlyInstallments: '',
        newContractYearlyIncome: '',
        selectedFile: '',
      },
      riskGuard: {
        contractRisk: '',
        extractedTerms: '',
      },
    },
  );
  const fileNameELementRef = useRef();

  const riskGuardService = new RiskGuard(user);

  let tempAppRootFolderId = appRootFolderId;

  const closeDialog = () => {
    setState((prevState) => ({
      ...prevState,
      newContractType: '',
      newContractName: '',
      newContractValue: '',
      newContractRequesterEmail: '',
      newContractMonthlyInstallments: '',
      newContractYearlyIncome: '',
      showBackdrop: false,
    }));
    onClose();
  };

  const setFileNameInputRef = (element) => {
    fileNameELementRef.current = element;
  };

  const selectFile = (event) => {
    const selectedFile = event.target.files[0];
    setState((prevState) => ({ ...prevState, selectedFile }));
    fileNameELementRef.current.innerHTML = selectedFile.name;
    if (!selectedFile.name.endsWith('.pdf')) {
      fileNameELementRef.current.innerHTML += '<br/><b>Note: This application only supports pdf files.</b>';
    }
  };

  const handleChangeContractType = (event) => {
    setState((prevState) => ({
      ...prevState,
      newContractType: event.target.value,
      newContractMonthlyInstallments: '',
      newContractYearlyIncome: '',
    }));
  };

  const handleChangeContractName = (event) => {
    setState((prevState) => ({ ...prevState, newContractName: event.target.value }));
  };

  const handleChangeContractValue = (event) => {
    setState((prevState) => ({ ...prevState, newContractValue: event.target.value }));
  };

  const handleChangeContractRequesterEmail = (event) => {
    setState((prevState) => ({ ...prevState, newContractRequesterEmail: event.target.value }));
  };

  const handleChangeContractMonthlyInstallments = (event) => {
    setState((prevState) => ({ ...prevState, newContractMonthlyInstallments: event.target.value }));
  };

  const handleChangeContractYearlyIncome = (event) => {
    setState((prevState) => ({ ...prevState, newContractYearlyIncome: event.target.value }));
  };

  const isLoanContract = () => state.newContractType === 'loan-contract';

  const canSubmit = () => (
    state.newContractName
    && state.newContractValue > 0
    && state.selectedFile
    && state.newContractRequesterEmail
    && (
      !isLoanContract() || (
        state.newContractMonthlyInstallments > 0
        && state.newContractYearlyIncome > 0
      )
    )
  );

  const exitAddContract = (errorMessage) => {
    closeDialog();
    if (errorMessage) {
      onAddContract(errorMessage);
    } else {
      onAddContract();
    }
  };

  const submitContract = async () => {
    setState((prevState) => ({ ...prevState, showBackdrop: true }));
    const risk = await riskGuardService.processDoc(
      state.selectedFile,
      state.selectedFile.name,
    );
    setState((prevState) => ({
      ...prevState,
      contractRisk: risk.data.riskClassification,
      extractedTerms: risk.data.extractedTerms,
    }));

    // Check for application root folder, and if not existing, create it
    if (tempAppRootFolderId === '') {
      const getAppFolderResponse = await axios.get(
        `${baseUrl}/cms/instances/folder/cms_folder?filter=name eq 'Contract Approval App'`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        },
      );
      if (getAppFolderResponse?.data?._embedded) {
        tempAppRootFolderId = getAppFolderResponse.data._embedded.collection[0].id;
        updateAppRootFolderId(tempAppRootFolderId);
      }
    }

    if (tempAppRootFolderId === '') {
      await axios.post(
        `${baseUrl}/cms/instances/folder/cms_folder`,
        {
          name: 'Contract Approval App',
        },
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        },
      ).then((res) => {
        if (res.data) {
          tempAppRootFolderId = res.data.id;
          updateAppRootFolderId(tempAppRootFolderId);
        }
      }).catch((error) => {
        const statusCode = error.response.status;
        let errorMessage;
        if (statusCode === 401) {
          // Unauthorized access
          errorMessage = 'Error creating App Root Folder: You are not authorized to access this resource. Your session might have timed out.';
        } else {
          errorMessage = `Error creating App Root Folder: ${JSON.stringify(error.response.data, null, 2)}`;
        }
        exitAddContract(`Error creating contract: ${errorMessage}`);
      });
    }

    // Check for customer folder, and if not existing, create it
    const customerEmail = state.newContractRequesterEmail;

    let parentFolderId = '';
    await axios.get(
      `${baseUrl}/cms/instances/folder/ca_customer?filter=parent_folder_id eq '${tempAppRootFolderId}' and name eq '${encodeURIComponent(customerEmail)}'`,
      {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      },
    ).then((res) => {
      if (res.data._embedded) {
        parentFolderId = res.data._embedded.collection[0].id;
      }
    });

    if (parentFolderId === '') {
      await axios.post(
        `${baseUrl}/cms/instances/folder/ca_customer`,
        {
          name: customerEmail,
          parent_folder_id: tempAppRootFolderId,
          properties: {
            customer_email: customerEmail,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        },
      ).then((res) => {
        if (res.data) {
          parentFolderId = res.data.id;
        }
      }).catch((error) => {
        const statusCode = error.response.status;
        let errorMessage;
        if (statusCode === 401) {
          // Unauthorized access
          errorMessage = 'Error creating Customer Folder: You are not authorized to access this resource. Your session might have timed out.';
        } else {
          errorMessage = `Error creating Customer Folder: ${JSON.stringify(error.response.data, null, 2)}`;
        }
        exitAddContract(`Error creating contract: ${errorMessage}`);
      });
    }

    // Get the ID of the 'Created' ACL
    let aclId = '';
    const getAclResponse = await axios.get(
      `${baseUrl}/cms/permissions?filter=name eq 'created'`,
      {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      },
    );
    if (getAclResponse?.data?._embedded) {
      aclId = getAclResponse.data._embedded.collection[0].id;
    }

    // Adding contract content file
    const formData = new FormData();
    formData.append(
      'file',
      state.selectedFile,
      state.selectedFile.name,
    );

    let createFileResponse;
    try {
      createFileResponse = await axios.post(
        `${process.env.REACT_APP_CSS_SERVICE_URL}/v3/files/fromStream`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${user.access_token}`,
          },
        },
      );
    } catch (error) {
      exitAddContract(`Error saving contract content file: ${JSON.stringify(error.response.data, null, 2)}`);
    }

    // Setting contract metadata
    const { originalFileName } = createFileResponse.data;
    let cmsType;
    if (isLoanContract()) {
      cmsType = 'ca_loan_contract';
    } else {
      cmsType = 'ca_contract';
    }

    let createMetadataResponse;
    try {
      createMetadataResponse = await axios.post(
        `${baseUrl}/cms/instances/file/${cmsType}`,
        {
          name: state.newContractName,
          parent_folder_id: parentFolderId,
          acl_id: aclId,
          renditions: [
            {
              name: originalFileName,
              rendition_type: 'primary',
              source: 'FILE_ID',
              blob_id: createFileResponse.data.id,
            },
          ],
          properties: {
            value: parseInt(state.newContractValue, 10),
            status: 'CREATED',
            requester_email: customerEmail,
            risk_classification: risk.data.riskClassification,
            extracted_terms: risk.data.extractedTerms,
            ...isLoanContract() && {
              monthly_installments: parseInt(state.newContractMonthlyInstallments, 10),
              yearly_income: parseInt(state.newContractYearlyIncome, 10),
            },
          },
          traits: {
            ca_approval: {
              'Automatic Approval': {
                is_required: true,
                has_been_granted: false,
                approver: '',
                approver_role: '',
              },
              'Line Manager Approval': {
                is_required: false,
                has_been_granted: false,
                approver: '',
                approver_role: '',
              },
              'Risk Manager Approval': {
                is_required: false,
                has_been_granted: false,
                approver: '',
                approver_role: '',
              },
              ...isLoanContract() && {
                'Solvency Check': {
                  is_required: false,
                  has_been_granted: false,
                  approver: '',
                  approver_role: '',
                },
              },
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        },
      );
    } catch (error) {
      const statusCode = error.response.status;
      let errorMessage;
      if (statusCode === 400) {
        // Validation error
        errorMessage = 'The parameter name is mandatory';
      } else if (statusCode === 401) {
        // Unauthorized access
        errorMessage = 'You are not authorized to access this resource. Your session might have timed out.';
      } else {
        errorMessage = JSON.stringify(error.response.data, null, 2);
      }
      exitAddContract(`Error setting contract metadata: ${errorMessage}`);
    }

    // Creating and adding contract PDF rendition (for viewer)
    try {
      await axios.post(
        `${baseUrl}/publication/api/v1/renditions`,
        {
          source: {
            // eslint-disable-next-line no-underscore-dangle
            url: createMetadataResponse.data._links['urn:eim:linkrel:download-media'].href,
            formatHint: 'application/pdf',
            filenameHint: originalFileName,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        },
      );
      exitAddContract();
    } catch (error) {
      exitAddContract(`Error creating contract PDF rendition: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  };

  return (
    <Dialog open={open} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Add Contract</DialogTitle>
      <DialogContent className="add-contract">
        <div className="select-document-button">
          <Button component="label" variant="contained" startIcon={<CloudUpload />}>
            Select Document
            {' '}
            <input id="files" type="file" accept="application/pdf" className="file-input" onChange={selectFile} />
          </Button>
          <span className="add-contract-filename" id="fileName" ref={setFileNameInputRef} />
        </div>
        <RadioGroup
          row
          defaultValue="standard-contract"
          name="contract-types-radio-buttons-group"
          onChange={handleChangeContractType}
        >
          <FormControlLabel value="standard-contract" control={<Radio />} label="Standard Contract" size="small" />
          <FormControlLabel value="loan-contract" control={<Radio />} label="Loan Contract" />
        </RadioGroup>
        <TextField
          margin="dense"
          id="contract-name"
          label="Document name"
          type="text"
          defaultValue=""
          fullWidth
          onChange={handleChangeContractName}

        />
        <TextField
          margin="dense"
          id="contract-value"
          label="Contract value"
          type="number"
          InputProps={{ inputProps: { min: 1 } }}
          fullWidth
          onChange={handleChangeContractValue}

        />
        {
          isLoanContract()
          && (
            <>
              <FormControl fullWidth margin="dense">
                <InputLabel id="contract-monthly-installments-label">Monthly installments</InputLabel>
                <Select
                  margin="dense"
                  labelId="contract-monthly-installments-label"
                  id="contract-monthly-installments"
                  label="Monthly installments"
                  type="number"
                  defaultValue=""
                  onChange={handleChangeContractMonthlyInstallments}
                >
                  <MenuItem value={12}>12</MenuItem>
                  <MenuItem value={24}>24</MenuItem>
                  <MenuItem value={36}>36</MenuItem>
                  <MenuItem value={48}>48</MenuItem>
                  <MenuItem value={60}>60</MenuItem>
                  <MenuItem value={72}>72</MenuItem>
                  <MenuItem value={84}>84</MenuItem>
                </Select>
              </FormControl>
              <TextField
                margin="dense"
                id="contract-yearly-income"
                label="Yearly income"
                type="number"
                defaultValue=""
                InputProps={{ inputProps: { min: 1 } }}
                fullWidth
                onChange={handleChangeContractYearlyIncome}
              />
            </>
          )
        }
        <TextField
          margin="dense"
          id="contract-requester-email"
          label="Contract requester email"
          type="text"
          defaultValue=""
          fullWidth
          onChange={handleChangeContractRequesterEmail}

        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => submitContract()}
          variant="contained"
          color="primary"
          disabled={!canSubmit()}
        >
          Add
        </Button>
        <Button onClick={() => closeDialog()} color="primary">
          Cancel
        </Button>
      </DialogActions>
      <Backdrop style={{ zIndex: 9999 }} open={state.showBackdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Dialog>
  );
}

AddContract.propTypes = {
  open: PropTypes.bool.isRequired,
  onAddContract: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AddContract;
