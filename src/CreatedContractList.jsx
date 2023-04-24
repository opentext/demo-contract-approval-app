import React from 'react';
import axios from 'axios';
import {
	Backdrop,
	Button,
	CircularProgress,
	IconButton,
	Paper,
	Snackbar,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow
} from '@material-ui/core';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';

import ContractDetails from './ContractDetails';
import AddContract from './AddContract';
import Pagination from './Pagination';
import DocumentDialogView from './DocumentDialogView';
import MuiAlert from '@material-ui/lab/Alert';
import RiskClassification from './RiskClassification';

const baseUrl = process.env.REACT_APP_BASE_SERVICE_URL;

const Alert = (props) => {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
}

/**
 * This view displays the list of created contracts. From here the user can request approval for any of them.
 */
class CreatedContractList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			contracts: [],
			lineManagerAclId: '',
			riskManagerAclId: '',
			completedAclId: '',
			openContractDetails: false,
			selectedContract: { properties: {} },
			openAddContract: false,
			addNumberOfContracts: 0,
			pageNumber: 0,
			count: -1,
			openDocumentDialogView: false,
			fileId: '',
			fileName: '',
			showBackdrop: false,
			showSnackBar: false,
			snackBarMessage: '',
			snackBarSeverity: 'success'
		};
		this.handleCloseAddContract = this.handleCloseAddContract.bind(this);
		this.handleCloseContractDetails = this.handleCloseContractDetails.bind(this);
		this.handleCloseDocumentDialogView = this.handleCloseDocumentDialogView.bind(this);
		this.handleSnackBarClose = this.handleSnackBarClose.bind(this);
		this.handlePageNumber = this.handlePageNumber.bind(this);
	}

	handleContractAdded = (errorMessage) => {
		if (!errorMessage) {
			this.setState({
				addNumberOfContracts: this.state.addNumberOfContracts + 1,
				snackBarSeverity: 'success',
				snackBarMessage: 'Contract added successfully'
			});
		} else {
			this.setState({
				snackBarSeverity: 'error',
				snackBarMessage: errorMessage
			});
		}
		this.setState({ showSnackBar: true });
	}

	handleCloseAddContract() {
		this.setState({ openAddContract: false })
	}

	handleCloseContractDetails() {
		this.setState({ openContractDetails: false })
	}

	handleCloseDocumentDialogView() {
		this.setState({ openDocumentDialogView: false })
	}

	handleSnackBarClose() {
		this.setState({ showSnackBar: false });
	}

	componentDidMount() {
		this.getAcls();
		this.getContracts();
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.addNumberOfContracts !== this.state.addNumberOfContracts
			|| prevState.pageNumber !== this.state.pageNumber
		) {
			this.getContracts();
		}
	}

	handlePageNumber(pageNumber) {
		this.setState({ pageNumber: pageNumber });
	}

	getContracts() {
		if (this.props.authContext.userName) {
			this.setState({ showBackdrop: true });
			axios({
				method: 'get',
				url: baseUrl + '/cms/instances/file/ca_contract/?include-total=true&sortby=create_time desc&filter=status eq "CREATED"&page='
					+ (this.state.pageNumber + 1),
				headers: this.props.authContext.headers
			}).then(res => {
				this.setState({
					contracts: res.data && res.data._embedded ? res.data._embedded.collection : [],
					count: res.data.total
				});
			}).catch(error => {
				let errorMessage = 'Could not get contracts: ';
				if (error.response != null && error.response.data != null) {
					errorMessage += error.response.data.exception;
				} else {
					errorMessage += error.message;
				}
				this.raiseError(this, errorMessage);
			}).finally(() => {
				this.setState({ showBackdrop: false });
			})
		} else {
			this.setState({ contracts: [], count: -1 });
		}
	}

	getAcls() {
		if (this.state.lineManagerAclId.length === 0 || this.state.riskManagerAclId.length === 0 || this.state.completedAclId === 0) {
			axios({
				method: 'get',
				url: baseUrl + '/cms/permissions?filter=name eq "line_manager_approval" or name eq "risk_manager_approval" or name eq "completed"',
				headers: this.props.authContext.headers
			}).then(res => {
				const acls = res.data._embedded.collection;
				acls.forEach((acl) => {
					switch(acl.name) {
						case "line_manager_approval":
							this.setState({
								lineManagerAclId: acl.id
							});
							break;
						case "risk_manager_approval":
							this.setState({
								riskManagerAclId: acl.id
							});
							break;
						case "completed":
							this.setState({
								completedAclId: acl.id
							});
							break;
						default:
					}
				});

				if (this.state.lineManagerAclId.length === 0 || this.state.riskManagerAclId.length === 0 || this.state.completedAclId === 0) {
					let errorMessage = 'Not all required ACLs exist in the repository';
					this.raiseError(this, errorMessage);
				}
			}).catch(error => {
				let errorMessage = 'Could not get ACLs: ';
				if (error.response != null && error.response.data != null) {
					errorMessage += error.response.data.exception;
				} else {
					errorMessage += error.message;
				}
				this.raiseError(this, errorMessage);
			});
		}
	}

	openDocumentDialogView(fileId, fileName) {
		this.setState({
			openDocumentDialogView: true,
			fileId: fileId,
			fileName: fileName
		});
	}

	startContractForApproval(contractId) {
		this.setState({ showBackdrop: true });

		let data = {
			"processDefinitionKey": "contract_approval",
			"name": "Approve contract",
			"outcome": "none",
			"variables": [
				{
					"name": "base_url",
					"value": baseUrl
				},
				{
					"name": "contract_id",
					"value": contractId
				},
				{
					"name": "line_manager_approval_acl_id",
					"value": this.state.lineManagerAclId
				},
				{
					"name": "risk_manager_approval_acl_id",
					"value": this.state.riskManagerAclId
				},
				{
					"name": "completed_acl_id",
					"value": this.state.completedAclId
				}
			],
			"returnVariables": true
		}
		axios({
			method: 'post',
			url: baseUrl + '/workflow/v1/process-instances',
			headers: this.props.authContext.headers,
			data: data
		}).then(() => {
			this.setState({ snackBarMessage: 'Approval requested successfully.' });
			this.setState({ showSnackBar: true });
			this.getContracts();
		}).catch(error => {
			const statusCode = error.response.status;
			let errorMessage = 'Error requesting approval: ';
			if (statusCode === 400) {
				errorMessage += error.response.data.exception;
			} else {
				errorMessage += error.message;
			}
			this.raiseError(this, errorMessage);
		}).finally(() => {
			this.setState({ showBackdrop: false });
		})
	}

	showDetails(contract) {
		this.setState({
			selectedContract: contract,
			openContractDetails: true
		});
	}

	getDateValue(dt) {
		return dt ? new Date(Date.parse(dt)).toLocaleString() : '';
	}

	openContractDialog() {
		this.setState({
			openAddContract: true
		});
	}

	raiseError(component, errorMessage) {
		component.setState({
			snackBarSeverity: 'error',
			snackBarMessage: errorMessage,
			showSnackBar: true
		});
	}

	render() {
		return (
			<div>
				<Button variant="contained" color="primary" disabled={!this.props.authContext.userName} startIcon={<AddIcon />} onClick={() => this.openContractDialog()} style={{ margin: "0.25rem" }}>Add</Button>
				<div className='content-header'>All created contracts</div>
				<TableContainer component={Paper}>
					<Table size="small" aria-label="a dense table">
						<TableHead>
							<TableRow>
								<TableCell>Contract name</TableCell>
								<TableCell align="left">Creation date</TableCell>
								<TableCell align="left">Value</TableCell>
								<TableCell align="left">Risk classification</TableCell>
								<TableCell align="left">View document</TableCell>
								<TableCell align="left">Action</TableCell>
								<TableCell align="left" />
							</TableRow>
						</TableHead>
						<TableBody>
							{this.state.contracts.map((row) => (
								<TableRow key={row.id}>
									<TableCell component="th" scope="row">
										{row.name}
									</TableCell>
									<TableCell align="left">{this.getDateValue(row.create_time)}</TableCell>
									<TableCell align="left">{row.properties.value}</TableCell>
									<TableCell align="left"><RiskClassification row={row} /></TableCell>
									<TableCell align="left">
										<Button size="small" variant="outlined" color="primary" onClick={() => { this.openDocumentDialogView(row.id, row.name) }}>Original</Button>
									</TableCell>
									<TableCell align="left">
										<Button size="small" variant="outlined" color="primary" onClick={() => { this.startContractForApproval(row.id) }}>Request approval</Button>
									</TableCell>
									<TableCell align="left">
										<IconButton size="small" variant="outlined" color="primary" title="Show details" onClick={() => { this.showDetails(row) }}>
											<ArrowForwardIosIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
				<Pagination pageNumber={this.state.pageNumber} count={this.state.count} handlePageNumber={this.handlePageNumber} />
				<ContractDetails open={this.state.openContractDetails} selectedContract={this.state.selectedContract} parent={this} parentRaiseError={this.raiseError} onClose={this.handleCloseContractDetails} />
				<AddContract authContext={this.props.authContext} open={this.state.openAddContract} onAddContract={this.handleContractAdded} onClose={this.handleCloseAddContract} />
				<DocumentDialogView open={this.state.openDocumentDialogView} fileId={this.state.fileId} onClose={this.handleCloseDocumentDialogView} />
				<Backdrop style={{ zIndex: 9999 }} open={this.state.showBackdrop}>
					<CircularProgress color="inherit" />
				</Backdrop>
				<Snackbar
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'center',
					}}
					open={this.state.showSnackBar}
					autoHideDuration={5000}
					onClose={this.handleSnackBarClose}
					action={
						<React.Fragment>
							<IconButton size="small" aria-label="close" color="inherit" onClick={this.handleSnackBarClose}>
								<CloseIcon fontSize="small" />
							</IconButton>
						</React.Fragment>
					}
				>
					<Alert onClose={this.handleSnackBarClose} severity={this.state.snackBarSeverity}>
						{this.state.snackBarMessage}
					</Alert>
				</Snackbar>
			</div>
		);
	}
}

export default CreatedContractList;
