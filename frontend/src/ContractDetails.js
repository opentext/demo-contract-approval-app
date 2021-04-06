import React from 'react'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

export default class ContractDetails extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        selectedContract: {
        	name:'',
        	properties:{},
        	create_time:''
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
						id="contract-email"
						label="Signer email address"
							value={this.state.selectedContract.properties.contract_signer_email}
						type="text"
						fullWidth
					/>
					<TextField
						margin="dense"
						id="createTime"
						label="Creation date"
						value={this.getDateValue(this.state.selectedContract.create_time)}
						type="text"
						InputLabelProps={{shrink: true,}}
						fullWidth
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => {this.closeDialog()}} variant="contained" color="primary">
						Close
					</Button>
				</DialogActions>
			</Dialog>
    	)
    }
}

