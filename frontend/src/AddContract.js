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
	DialogTitle
} from "@material-ui/core";

export default class AddContract extends React.Component {
	constructor(props) {
		super(props);

		this.handleChangeContractName = this.handleChangeContractName.bind(this);
		this.handleChangeContractValue = this.handleChangeContractValue.bind(this);
		this.handleChangeContractRequesterEmail = this.handleChangeContractRequesterEmail.bind(this);
		this.handleChangeContractRequesterEmail = this.handleChangeContractRequesterEmail.bind(this);
		this.canSubmit = this.canSubmit.bind(this);

		this.state = {
			showBackdrop: false,
			selectedContract: {
				newContractName: '',
				newContractValue: '',
				newContractRequesterEmail: '',
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
			newContractName: '',
			newContractValue: '',
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

	async submitContract() {
		this.setState({ showBackdrop: true });
		const formData = new FormData();
		formData.append(
			'file',
			this.state.selectedFile,
			this.state.selectedFile.name,
		);

		await axios.post(
			'/api/rg/process',
			formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				},
			}
		).then(res => {
			this.setState({
				contractRisk: res.data.riskClassification,
				extractedTerms: res.data.extractedTerms
			});
		});

		// Adding Contract
		axios.post(
			'/api/css/uploadcontent?avs-scan=false',
			formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				},
			}
		).then(res => {
			// Setting metadata
			return axios({
				method: 'post',
				url: '/api/cms/instances/file/ot2_app_contract',
				data: {
					"name": this.state.newContractName,
					"renditions": [
						{
							"name": res.data.entries[0].fileName,
							"rendition_type": "primary",
							"blob_id": res.data.entries[0].id
						}
					],
					"properties": {
						"contract_value": parseInt(this.state.newContractValue, 10),
						"contract_status": "CREATED",
						"contract_requester_email": this.state.newContractRequesterEmail,
						"contract_risk": this.state.contractRisk,
						"extracted_terms": this.state.extractedTerms
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
		return this.state.newContractName && this.state.newContractValue > 0 && this.state.selectedFile && this.state.newContractRequesterEmail;
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
					<TextField
						margin="dense"
						id="contract-name"
						label="Document name"
						type="text"
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
					<TextField
						margin="dense"
						id="contract-requester-email"
						label="Contract requester email"
						type="text"
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
