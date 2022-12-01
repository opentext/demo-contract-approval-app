import React from 'react';
import axios from 'axios';
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
} from "@material-ui/core";
import RiskGuard from './services/riskguard/RiskGuard';
import ApplicationContext from './context/ApplicationContext';

const baseUrl = process.env.REACT_APP_BASE_URL;

class AddContract extends React.Component {
	static contextType = ApplicationContext;

	constructor(props) {
		super(props);

		this.handleChangeContractType = this.handleChangeContractType.bind(this);
		this.handleChangeContractName = this.handleChangeContractName.bind(this);
		this.handleChangeContractValue = this.handleChangeContractValue.bind(this);
		this.handleChangeContractRequesterEmail = this.handleChangeContractRequesterEmail.bind(this);
		this.handleChangeContractMonthlyInstallments = this.handleChangeContractMonthlyInstallments.bind(this);
		this.handleChangeContractYearlyIncome = this.handleChangeContractYearlyIncome.bind(this);
		this.canSubmit = this.canSubmit.bind(this);

		this.state = {
			showBackdrop: false,
			selectedContract: {
				newContractType: '',
				newContractName: '',
				newContractValue: '',
				newContractRequesterEmail: '',
				newContractMonthlyInstallments: '',
				newContractYearlyIncome: '',
				selectedFile: ''
			},
			riskGuard: {
				contractRisk: '',
				extractedTerms: ''
			}
		};
	}

	closeDialog() {
		this.setState({
			newContractType: '',
			newContractName: '',
			newContractValue: '',
			newContractRequesterEmail: '',
			newContractMonthlyInstallments: '',
			newContractYearlyIncome: '',
			showBackdrop: false
		});
		this.props.onClose();
	}

	selectFile = event => {
		let selectedFile = event.target.files[0];
		this.setState({ selectedFile: selectedFile });
		this.fileNameText.innerHTML = selectedFile.name;
		if (! /\.pdf$/.test(selectedFile.name)) {
			this.fileNameText.innerHTML += "<br/><b>Note: This application only supports pdf files.</b>";
		}
	}

	setFileNameInputRef = element => {
		this.fileNameText = element;
	}

	handleChangeContractType(event) {
		this.setState({
			newContractType: event.target.value,
			newContractMonthlyInstallments: '',
			newContractYearlyIncome: ''
		});
	}

	handleChangeContractName(event) {
		this.setState({
			newContractName: event.target.value
		});
	}

	handleChangeContractValue(event) {
		this.setState({
			newContractValue: event.target.value
		});
	}

	handleChangeContractRequesterEmail(event) {
		this.setState({
			newContractRequesterEmail: event.target.value
		});
	}

	handleChangeContractMonthlyInstallments(event) {
		this.setState({
			newContractMonthlyInstallments: event.target.value
		});
	}

	handleChangeContractYearlyIncome(event) {
		this.setState({
			newContractYearlyIncome: event.target.value
		});
	}

	async submitContract() {
		this.setState({ showBackdrop: true });
		const riskGuardService = new RiskGuard(this.props);
		const risk = await riskGuardService.processDoc(this.state.selectedFile, this.state.selectedFile.name);
		this.setState({
			contractRisk: risk.data.riskClassification,
			extractedTerms: risk.data.extractedTerms
		});

		// Check for application root folder, and if not existing, create it
		if (this.context.appRootFolderId === '') {
			await axios.get(
				baseUrl + '/cms/instances/folder/cms_folder?filter=name eq \'Contract Approval App\'',
				{
					headers: this.props.authContext.headers
				}
			).then(res => {
				if (res.data._embedded) {
					let appRootFolderId = res.data._embedded.collection[0].id;
					const { updateAppRootFolderId } = this.context;
					updateAppRootFolderId(appRootFolderId);
				}
			});
		};

		if (this.context.appRootFolderId === '') {
			await axios.post(
				baseUrl + '/cms/instances/folder/cms_folder',
				{
					"name": "Contract Approval App",
				},
				{
					headers: this.props.authContext.headers
				}
			).then(res => {
				if (res.data) {
					let appRootFolderId = res.data.id;
					const { updateAppRootFolderId } = this.context;
					updateAppRootFolderId(appRootFolderId);
				}
			}).catch(error => {
				const statusCode = error.response.status;
				let errorMessage;
				if (statusCode === 401) {
					// Unauthorized access
					errorMessage = 'Error creating App Root Folder: You are not authorized to access this resource. Your session might have timed out.';
				} else {
					errorMessage = `Error creating App Root Folder: ${JSON.stringify(error.response.data, null, 2)}`;
				}
				this.props.onAddContract("Error creating contract: " + errorMessage);
			})
		};

		// Check for customer folder, and if not existing, create it
		const appRootFolderId = this.context.appRootFolderId;
		const customerEmail = this.state.newContractRequesterEmail;

		let parentFolderId = '';
		await axios.get(
			`${baseUrl}/cms/instances/folder/ca_customer?filter=parent_folder_id eq '${appRootFolderId}' and name eq '${encodeURIComponent(customerEmail)}'`,
			{
				headers: this.props.authContext.headers
			}
		).then(res => {
			if (res.data._embedded) {
				parentFolderId = res.data._embedded.collection[0].id;
			}
		});

		if (parentFolderId === '') {
			await axios.post(
				baseUrl + '/cms/instances/folder/ca_customer',
				{
					"name": customerEmail,
					"parent_folder_id": appRootFolderId,
					"properties": {
						"customer_email": customerEmail
					}
				},
				{
					headers: this.props.authContext.headers
				}
			).then(res => {
				if (res.data) {
					parentFolderId = res.data.id;
				}
			}).catch(error => {
				const statusCode = error.response.status;
				let errorMessage;
				if (statusCode === 401) {
					// Unauthorized access
					errorMessage = 'Error creating Customer Folder: You are not authorized to access this resource. Your session might have timed out.';
				} else {
					errorMessage = `Error creating Customer Folder: ${JSON.stringify(error.response.data, null, 2)}`;
				}
				this.props.onAddContract("Error creating contract: " + errorMessage);
			})
		};

		// Get the ID of the 'Created' ACL
		let aclId = '';
		await axios.get(
			`${baseUrl}/cms/permissions?filter=name eq 'created'`,
			{
				headers: this.props.authContext.headers
			}
		).then(res => {
			if (res.data._embedded) {
				aclId = res.data._embedded.collection[0].id;
			}
		});

		// Adding Contract
		const formData = new FormData();
		formData.append(
			'file',
			this.state.selectedFile,
			this.state.selectedFile.name,
		);
		axios.post(
			baseUrl +  '/css/v2/tenant/' + process.env.REACT_APP_TENANT_ID + '/content?avs-scan=false',
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
					'Authorization': this.props.authContext.headers.Authorization
				},
			}
		).then(res => {
			let cmsType;
			if (this.isLoanContract()) {
				cmsType = 'ca_loan_contract'
			} else {
				cmsType = 'ca_contract'
			}

			// Setting metadata
			return axios({
				method: 'post',
				url: `${baseUrl}/cms/instances/file/${cmsType}`,
				headers: this.props.authContext.headers,
				data: {
					"name": this.state.newContractName,
					"parent_folder_id": parentFolderId,
					"acl_id": aclId,
					"renditions": [
						{
							"name": res.data.entries[0].fileName,
							"rendition_type": "primary",
							"blob_id": res.data.entries[0].id
						},
						{
						  "name": "Brava rendition",
						  "mime_type": "application/vnd.blazon+json",
						  "rendition_type": "SECONDARY"
						}
					],
					"properties": {
						"value": parseInt(this.state.newContractValue, 10),
						"status": "CREATED",
						"requester_email": customerEmail,
						"risk_classification": this.state.contractRisk,
						"extracted_terms": this.state.extractedTerms,
						...this.isLoanContract() && {
							"monthly_installments": parseInt(this.state.newContractMonthlyInstallments),
							"yearly_income": parseInt(this.state.newContractYearlyIncome)
						}
					},
					"traits": {
						"ca_approval": {
							"Automatic Approval": {
								"is_required": true,
								"has_been_granted": false,
								"approver": "",
								"approver_role": "",
							},
							"Line Manager Approval": {
								"is_required": false,
								"has_been_granted": false,
								"approver": "",
								"approver_role": "",
							},
							"Risk Manager Approval": {
								"is_required": false,
								"has_been_granted": false,
								"approver": "",
								"approver_role": "",
							},
							...this.isLoanContract() && {
								"Solvency Check": {
									"is_required": true,
									"has_been_granted": false,
									"approver": "",
									"approver_role": "",
								}
							}
						}
					}
				},
			})
		}).then(() => {
			this.closeDialog();
			this.props.onAddContract();
		}).catch(error => {
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
			this.props.onAddContract("Error creating contract: " + errorMessage);
		}).finally(() => {
			this.setState({ showBackdrop: false });
		})
	}

	canSubmit() {
		return (
			this.state.newContractName &&
			this.state.newContractValue > 0 &&
			this.state.selectedFile &&
			this.state.newContractRequesterEmail &&
			(
				!this.isLoanContract() ||
				(
					this.state.newContractMonthlyInstallments > 0 &&
					this.state.newContractYearlyIncome > 0
				)
			)
		);
	}

	isLoanContract() {
		return this.state.newContractType === "loan-contract";
	}

	render() {
		return (
			<Dialog open={this.props.open} aria-labelledby="form-dialog-title">
				<DialogTitle id="form-dialog-title">Add Contract</DialogTitle>
				<DialogContent className="add-contract">
					<div>
						<div className="inline">
							<label htmlFor="files" className="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary">Select Document</label>
							<input id="files" type="file" accept="application/pdf" className="file-input" onChange={this.selectFile} />
						</div>
						<div id="fileName" className="inline margin-start" ref={this.setFileNameInputRef} />
					</div>
					<br />
					<RadioGroup
						row
						defaultValue="standard-contract"
						name="contract-types-radio-buttons-group"
						onChange={this.handleChangeContractType}
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
						onChange={this.handleChangeContractName}

					/>
					<TextField
						margin="dense"
						id="contract-value"
						label="Contract value"
						type="number"
						InputProps={{ inputProps: { min: 1 } }}
						fullWidth
						onChange={this.handleChangeContractValue}

					/>
					{
						this.isLoanContract() &&
						<>
							<FormControl fullWidth>
							<InputLabel id="contract-monthly-installments-label">Monthly installments</InputLabel>
								<Select
									margin="dense"
									labelId="contract-monthly-installments-label"
									id="contract-monthly-installments"
									label="Monthly installments"
									type="number"
									defaultValue=""
									onChange={this.handleChangeContractMonthlyInstallments}
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
								onChange={this.handleChangeContractYearlyIncome}
							/>
						</>
					}
					<TextField
						margin="dense"
						id="contract-requester-email"
						label="Contract requester email"
						type="text"
						defaultValue=""
						fullWidth
						onChange={this.handleChangeContractRequesterEmail}

					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => { this.submitContract() }} variant="contained" color="primary"
						disabled={!this.canSubmit()}>
						Add
					</Button>
					<Button onClick={() => { this.closeDialog() }} color="primary">
						Cancel
					</Button>
				</DialogActions>
				<Backdrop style={{ zIndex: 9999 }} open={this.state.showBackdrop}>
					<CircularProgress color="inherit" />
				</Backdrop>
			</Dialog>
		)
	}
}

export default AddContract;
