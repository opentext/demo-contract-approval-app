import React from 'react'
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle
} from '@material-ui/core';

export default class ExtractedPersonalData extends React.Component {
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

	formatExtractedTerms(arr) {
		if (arr) {
			return arr.map(str => str.startsWith("**") ? <b><p>{str.substring(2)}</p></b>:<p>- {str}</p>);
		}
		return '';
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
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

	render() {
		return (
			<Dialog open={this.props.open} aria-labelledby="form-dialog-title">
				<DialogTitle id="form-dialog-title">Extracted Terms</DialogTitle>
				<DialogContent>
					<div>{this.formatExtractedTerms(this.state.selectedContract.properties.extracted_terms)}</div>
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

