import React, { Component } from 'react';
import { IconButton } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import ExtractedPersonalData from './ExtractedPersonalData';

const riskClassifications = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'VERY HIGH'];

export class RiskClassification extends Component {
	constructor(props) {
		super(props);

		this.state = {
			openExtractedPersonalData: false,
            row: props.row
		};
		this.handleCloseExtractedPersonalData = this.handleCloseExtractedPersonalData.bind(this);
	}

	showExtractedPersonalData() {
		this.setState({
			openExtractedPersonalData: true
		});
	}

    handleCloseExtractedPersonalData() {
		this.setState({ openExtractedPersonalData: false })
	}

    render() {
        return (
            <div>
                {riskClassifications[this.state.row.properties.contract_risk - 1]}
                <IconButton size="small" variant="outlined" color="primary" title="Show extracted personal data" onClick={() => { this.showExtractedPersonalData(this.state.row) }}>
                    <InfoIcon />
                </IconButton>
                <ExtractedPersonalData open={this.state.openExtractedPersonalData} selectedContract={this.state.row} onClose={this.handleCloseExtractedPersonalData} />
            </div>
        )
    }
}

export default RiskClassification

