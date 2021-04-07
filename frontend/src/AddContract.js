import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import axios from 'axios';

export default class AddContract extends React.Component {
	constructor(props) {
		super(props);

		this.handleChangeContractName = this.handleChangeContractName.bind(this);
		this.handleChangeContractValue = this.handleChangeContractValue.bind(this);
		this.handleChangeContractSignerEmail = this.handleChangeContractSignerEmail.bind(this);

		this.state = {
			selectedContract: {
				newContractName: '',
				newContractSignerEmail: '',
				newContractValue: '',
				selectedFile: ''
			}
		};
		axios.interceptors.request.use(request => {
			console.log('Starting Request', JSON.stringify(request, null, 2));
			return request;
		})

		axios.interceptors.response.use(response => {
			console.log('Response:', JSON.stringify(response, null, 2));
			return response;
		})
	}

	closeDialog() {
		this.setState({
			newContractName: '',
			newContractValue: '',
			newContractSignerEmail: ''
		});
		this.props.onClose();
	}

	getDateValue(dt) {
		return dt ? dt.replace(/Z$/, '') : '';
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

	handleChangeContractSignerEmail(event) {
		this.setState({
			newContractSignerEmail: event.target.value
		});
	}

	submitContract() {
		const formData = new FormData();
		formData.append(
			'file',
			this.state.selectedFile,
			this.state.selectedFile.name,
		);
		axios.defaults.baseURL = '';
		axios.post('/api/css/uploadcontent?avs-scan=false', formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			},
		}).then(res => {
			axios({
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
						"contract_signer_email": this.state.newContractSignerEmail
					}
				},
			}).then(() => {
				this.closeDialog();
				this.props.onAddContract();
			}).catch(error => {
				alert("Error in cms contract file: " + error.response.data);
			});
		}).catch(error => {
			alert("Error in add css document: " + error.response.data);
		});
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
						<div id="fileName" className="inline margin-start" ref={this.setFileNameInputRef}></div>
					</div>
					<TextField
						margin="dense"
						id="contract-name"
						label="Name"
						type="text"
						fullWidth
						onChange={this.handleChangeContractName}
					/>
					<TextField
						margin="dense"
						id="contract-value"
						label="Value"
						type="number"
						InputProps={{ inputProps: { min: 1 } }}
						fullWidth
						onChange={this.handleChangeContractValue}
					/>
					<TextField
						margin="dense"
						id="contract-email"
						label="Signer email address"
						type="text"
						fullWidth
						onChange={this.handleChangeContractSignerEmail}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => { this.submitContract() }} variant="contained" color="primary"
						disabled={!(this.state.newContractName && this.state.newContractValue > 0 && this.state.newContractSignerEmail && this.state.selectedFile)}>
						Add
	          </Button>
					<Button onClick={() => { this.closeDialog() }} color="primary">
						Cancel
	          </Button>
				</DialogActions>
			</Dialog>
		)
	}
}

