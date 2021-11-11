import React from 'react';
import {connect} from 'react-redux';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography} from '@material-ui/core';
import axios from "axios";

class ManualConfigurationDialog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            isError: false,
            message: "",
            tenantId: undefined,
            clientId: undefined,
            clientSecret: undefined,
            completed: false
        };
        this.handleChangeTenantId = this.handleChangeTenantId.bind(this);
        this.handleChangeClientId = this.handleChangeClientId.bind(this);
        this.handleChangeClientSecret = this.handleChangeClientSecret.bind(this);
        this.canSubmit = this.canSubmit.bind(this);
        this.submit = this.submit.bind(this);
        this.resetDialog = this.resetDialog.bind(this);
    }

    handleChangeTenantId(event) {
        this.setState({
            tenantId: event.target.value
        });
    }

    handleChangeClientId(event) {
        this.setState({
            clientId: event.target.value
        });
    }

    handleChangeClientSecret(event) {
        this.setState({
            clientSecret: event.target.value
        });
    }

    canSubmit() {
        return this.state.tenantId && this.state.clientId && this.state.clientSecret;
    }

    submit() {
		// Manual Config Dialog - calling /configuration
        axios.post("/configuration",{
            tenantId: this.state.tenantId,
            client_id: this.state.clientId,
            client_secret: this.state.clientSecret
        }, {
            headers: {
                "Content-Type": "application/json",
            }
        }).then(response => {
            this.setState({
                completed: true,
                message: response.data.message,
                isError: false
            });
        }).catch(() => {
            this.setState({
                isError: true,
                completed: false
            })
        })
    }

    resetDialog() {
        this.props.closeDialog();
        this.setState({
            open: false,
            isError: false,
            message: "",
            tenantId: undefined,
            clientId: undefined,
            clientSecret: undefined,
            completed: false
        });
    }

    render() {
        const {
            message,
            isError
        } = this.state;
        return (
            <div>
                <Dialog open={this.props.open} aria-labelledby="form-dialog-title">
                    <div className="configuration-dialog">
                        <DialogTitle id="form-dialog-title">Edit configuration</DialogTitle>
                        <DialogContent>
                            <Typography variant="subtitle2">
                                Please enter the configuration details.
                            </Typography>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="tenant_id"
                                label="Tenant Id"
                                type="text"
                                fullWidth
                                onChange={this.handleChangeTenantId}
                            />
                            <TextField
                                margin="dense"
                                id="client_id"
                                label="Client Id"
                                type="text"
                                fullWidth
                                onChange={this.handleChangeClientId}
                            />
                            <TextField
                                margin="dense"
                                id="client_secret"
                                label="Client secret"
                                type="text"
                                fullWidth
                                onChange={this.handleChangeClientSecret}
                            />

                            <div className="top-margin">
                                <Typography variant="subtitle2" className={`message ${isError ? "error" : ""}`}>
                                    {message}
                                </Typography>
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.resetDialog} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={this.state.completed ? this.resetDialog : this.submit} disabled={!this.canSubmit()} variant="contained" color="primary">
                                {this.state.completed ? 'Close' : 'Submit'}
                            </Button>
                        </DialogActions>
                    </div>
                </Dialog>
            </div>
        );
    }
}

const mapStateToProps = state => ({
})

export default connect(mapStateToProps)(ManualConfigurationDialog);
