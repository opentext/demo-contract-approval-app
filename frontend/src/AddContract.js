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

		this.state = {
			showBackdrop: false,
			selectedContract: {
				newContractName: '',
				newContractValue: '',
				selectedFile: ''
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

	handleChangeContractRequesterEmail(event) {
		this.setState({
			newContractRequesterEmail: event.target.value
		});
	}

	submitContract() {
		this.setState({ showBackdrop: true });
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
						"contract_requester_email": this.state.newContractRequesterEmail
					}
				},
			}).then(() => {
				this.closeDialog();
				this.props.onAddContract();
			}).catch(error => {
				alert("Error in cms contract file: " + error.response.data);
				this.setState({ showBackdrop: false });
			});
		}).catch(error => {
			alert("Error in add css document: " + error.response.data);
			this.setState({ showBackdrop: false });
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
						disabled={!(this.state.newContractName && this.state.newContractValue > 0 && this.state.selectedFile)}>
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
