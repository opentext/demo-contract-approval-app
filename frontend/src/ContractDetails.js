import React from 'react'
import {
	Button,
	TextField,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle
} from '@material-ui/core';

export default class ContractDetails extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedContract: {
				name: '',
				properties: {},
				create_time: ''
			}
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.open !== this.props.open
			|| prevProps.selectedContract !== this.props.selectedContract) {
			this.setState({
				selectedContract: this.props.selectedContract
			});
		}
	}

	closeDialog() {
		this.props.onClose();
	}

	getDateValue(dt) {
		return dt ? new Date(Date.parse(dt)).toLocaleString() : '';
	}

	render() {
		return (
			<Dialog open={this.props.open} aria-labelledby="form-dialog-title">
				<DialogTitle id="form-dialog-title">Contract details</DialogTitle>
				<DialogContent>
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
						value={this.state.selectedContract.properties.contract_status}
						type="text"
						fullWidth
					/>
					<TextField
						margin="dense"
						id="contract-value"
						label="Value"
						value={this.state.selectedContract.properties.contract_value}
						type="text"
						fullWidth
					/>
					<TextField
						margin="dense"
						id="contract-risk"
						label="Risk classification"
						value={this.state.selectedContract.properties.contract_risk}
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
						value={this.state.selectedContract.properties.contract_requester_email}
						type="text"
						fullWidth
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => { this.closeDialog() }} variant="contained" color="primary">
						Close
					</Button>
				</DialogActions>
			</Dialog>
		)
	}
}

