import React from 'react';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import AddIcon from '@material-ui/icons/Add';
import axios from 'axios';
import { connect } from 'react-redux';
import ContractDetails from './ContractDetails';
import AddContract from './AddContract';
import Pagination from './Pagination';
import DocumentDialogView from './DocumentDialogView';

class CreatedContractList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			contracts: [],
			openContractDetails: false,
			selectedContract: { properties: {} },
			openAddContract: false,
			addNumberOfContracts: 0,
			pageNumber: 0,
			count: -1,
			openDocumentDialogView: false,
			downloadHref: ''
		};
		this.handleContractAdded = this.handleContractAdded.bind(this);
		this.handleCloseAddContract = this.handleCloseAddContract.bind(this);
		this.handleCloseContractDetails = this.handleCloseContractDetails.bind(this);
		this.handleCloseDocumentDialogView = this.handleCloseDocumentDialogView.bind(this);
	}

	handleContractAdded() {
		this.setState({ addNumberOfContracts: this.state.addNumberOfContracts + 1 })
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

	componentDidMount() {
		this.getContracts();
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.addNumberOfContracts !== this.state.addNumberOfContracts
			|| prevState.pageNumber !== this.state.pageNumber
			|| prevProps.username !== this.props.username) {
			this.getContracts();
		}
	}

	handlePageNumber = (pageNumber) => {
		this.setState({ pageNumber: pageNumber });
	}

	getContracts() {
		if (this.props.username) {
			axios.defaults.baseURL = '';
			axios({
				method: 'get',
				url: '/api/cms/instances/file/ot2_sign_contract/?include-total=true&sortby=create_time desc&filter=contract_status eq "CREATED"&page=' + (this.state.pageNumber + 1),
			}).then(res => {
				this.setState({
					contracts: res.data && res.data._embedded ? res.data._embedded.collection : [],
					count: res.data.total
				});
			}).catch(error => {
				alert(error.message);
			});
		} else {
			this.setState({ contracts: [], count: -1 });
		}
	}

	openDocumentDialogView(downloadHref) {
		this.setState({
			openDocumentDialogView: true,
			downloadHref: downloadHref
		});
	}


	startContractForSignature(contractId) {
		axios.defaults.baseURL = '';
		console.log(contractId);
		axios({
			method: 'post',
			url: '/api/workflow/createinstance',
			data: {
				"processDefinitionKey": "signContractId",
				"name": "Sign contract",
				"outcome": "none",
				"variables": [
					{
						"name": "contract_id",
						"value": contractId
					},
					{
						"name": "signature_poller_interval",
						"value": "PT2M"
					},
					{
						"name": "signature_auto_expire_days",
						"value": 10
					}
				],
				"returnVariables": true
			}
		}).then(res => {
			this.getContracts();
		}).catch(error => {
			alert(error.message);
		});
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

	render() {
		return (
			<div>
				<Button variant="contained" color="primary" disabled={!this.props.username} startIcon={<AddIcon />} onClick={() => this.openContractDialog()} style={{ margin: "0.25rem" }}>Add</Button>
				<div className='content-header'>All created contracts</div>
				<TableContainer component={Paper}>
					<Table size="small" aria-label="a dense table">
						<TableHead>
							<TableRow>
								<TableCell>Contract name</TableCell>
								<TableCell align="left">Creation date</TableCell>
								<TableCell align="left">Value</TableCell>
								<TableCell align="left">View document</TableCell>
								<TableCell align="left">Action</TableCell>
								<TableCell align="left"></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{this.state.contracts.map((row) => (
								<TableRow key={row.id}>
									<TableCell component="th" scope="row">
										{row.name}
									</TableCell>
									<TableCell align="left">{this.getDateValue(row.create_time)}</TableCell>
									<TableCell align="left">{row.properties.contract_value}</TableCell>
									<TableCell align="left">
										<Button size="small" variant="outlined" color="primary" onClick={() => { this.openDocumentDialogView(row._links['urn:eim:linkrel:download-media'].href) }}>Original</Button>
									</TableCell>
									<TableCell align="left">
										<Button size="small" variant="outlined" color="primary" onClick={() => { this.startContractForSignature(row.id) }}>Request signature</Button>
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
				<ContractDetails open={this.state.openContractDetails} selectedContract={this.state.selectedContract} onClose={this.handleCloseContractDetails} />
				<AddContract open={this.state.openAddContract} onAddContract={this.handleContractAdded} onClose={this.handleCloseAddContract} />
				<DocumentDialogView open={this.state.openDocumentDialogView} downloadHref={this.state.downloadHref} onClose={this.handleCloseDocumentDialogView} />
			</div>
		);
	}
}

const mapStateToProps = state => ({
	username: state.username,
})

export default connect(mapStateToProps)(CreatedContractList);