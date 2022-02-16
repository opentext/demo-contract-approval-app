import React from 'react';
import axios from 'axios';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tabs,
	TextField
} from '@material-ui/core';

function TabPanel(props) {
	const { children, value, index, ...other } = props;
	return (
		<div
		role="tabpanel"
		hidden={value !== index}
		{...other}
		>
		{value === index && (
			<div>{children}</div>
		)}
		</div>
	);
}

function getApprovals(trait) {
	let approvals = [];

	for (let key in trait) {
		let approval = trait[key];
		approval['trait_name'] = key;
		approvals.push(approval);
	}
	
	return approvals.sort((a, b) => a.trait_name < b.trait_name ? -1 : 1);
}

function ensureNonNullStringValue(propertyValue) {
	let stringValue;

	if (typeof propertyValue == "boolean") {
		stringValue = propertyValue.toString();
	} else if (propertyValue) {
		stringValue = propertyValue;
	} else {
		stringValue = '';
	}

	return stringValue;
}

export default class ContractDetails extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			value: 0,
			selectedContract: {
				name: '',
				properties: {},
				traits: {},
				create_time: ''
			},
		}
	}

	raiseError(errorMessage) {
		this.closeDialog();
		this.props.raiseError(errorMessage);
	}

	handleChange = (event, newValue) => {
		this.setState({ value: newValue });
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.open !== this.props.open || prevProps.selectedContract !== this.props.selectedContract) {
			this.setState({
				selectedContract: {}
			});
			this.fetchSelectedContract();
		}
	}

	closeDialog() {
		this.props.onClose();
	}

	getDateValue(dt) {
		return dt ? new Date(Date.parse(dt)).toLocaleString() : '';
	}

	async fetchSelectedContract() {
		await axios({
			method: 'get',
			url: `/api/cms/instances/file/${this.props.selectedContract.type}/${this.props.selectedContract.id}`,
		}).then(res => {
			this.setState({
				selectedContract: res.data
			});
		}).catch(error => {
			let errorMessage = `Could not fetch ${this.props.selectedContract.type} with Id ${this.props.selectedContract.id}: `;
			if (error.response != null && error.response.data != null) {
				errorMessage += error.response.data.exception;
			} else {
				errorMessage += error.message;
			}
			this.raiseError(errorMessage);
		})
	}

	render() {
		return (
			<>
				{
					this.state.selectedContract.id &&
					<Dialog open={this.props.open} aria-labelledby="form-dialog-title">
						<DialogTitle id="form-dialog-title">Contract details</DialogTitle>
						<DialogContent  className="contract-details">
						<Tabs orientation="horizontal" value={this.state.value}	onChange={this.handleChange}>
							<Tab className="tab-caption" label="Properties" />
							<Tab className="tab-caption" label="Approvals" />
						</Tabs>
						<TabPanel value={this.state.value} index={0}>
									<TextField
										margin="dense"
										id="contract-name"
										label="Name"
										value={this.state.selectedContract.name}
										type="text"
										fullWidth
									/>
									<TextField
										margin="dense"
										id="contract-status"
										label="Status"
										value={this.state.selectedContract.properties.status}
										type="text"
										fullWidth
									/>
									<TextField
										margin="dense"
										id="contract-value"
										label="Value"
										value={this.state.selectedContract.properties.value}
										type="text"
										fullWidth
									/>
									{
										this.state.selectedContract.type === 'ca_loan_contract' &&
										<>
											<TextField
												margin="dense"
												id="monthly-installments"
												label="Monthly installments"
												value={this.state.selectedContract.properties.monthly_installments}
												type="text"
												fullWidth
											/>
											<TextField
												margin="dense"
												id="yearly-income"
												label="Yearly income"
												value={this.state.selectedContract.properties.yearly_income}
												type="text"
												fullWidth
											/>
										</>
									}
									<TextField
										margin="dense"
										id="contract-risk"
										label="Risk classification"
										value={this.state.selectedContract.properties.risk_classification}
										type="text"
										fullWidth
									/>
									<TextField
										margin="dense"
										id="createTime"
										label="Creation date"
										value={this.getDateValue(this.state.selectedContract.create_time)}
										type="text"
										InputLabelProps={{ shrink: true, }}
										fullWidth
									/>
									<TextField
										margin="dense"
										id="contract-requester-email"
										label="Contract requester email"
										value={this.state.selectedContract.properties.requester_email}
										type="text"
										fullWidth
									/>
						</TabPanel>
						<TabPanel value={this.state.value} index={1}>
							<TableContainer>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell></TableCell>
											<TableCell align="right">Required</TableCell>
											<TableCell align="right">Granted</TableCell>
											<TableCell align="right">Approver</TableCell>
											<TableCell align="right">Approver role</TableCell>
											<TableCell align="right">Approval date</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{getApprovals(this.state.selectedContract.traits.ca_approval).map((approval) => (
											<TableRow key={approval.trait_name}>
												<TableCell component="th" scope="row">{ensureNonNullStringValue(approval.trait_name)}</TableCell>
												<TableCell align="right">{ensureNonNullStringValue(approval.is_required)}</TableCell>
												<TableCell align="right">{ensureNonNullStringValue(approval.has_been_granted)}</TableCell>
												<TableCell align="right">{ensureNonNullStringValue(approval.approver)}</TableCell>
												<TableCell align="right">{ensureNonNullStringValue(approval.approver_role)}</TableCell>
												<TableCell align="right">{ensureNonNullStringValue(approval.approval_date)}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</TabPanel>
						</DialogContent>
						<DialogActions>
							<Button onClick={() => { this.closeDialog() }} variant="contained" color="primary">
								Close
							</Button>
						</DialogActions>
					</Dialog>
				}
			</>
		)
	}
}

