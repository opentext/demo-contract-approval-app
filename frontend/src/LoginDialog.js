import React from 'react';
import axios from 'axios';
import {connect} from 'react-redux';
import BuildIcon from '@material-ui/icons/Build';
import Alert from '@material-ui/lab/Alert';
import {
  Backdrop,
  Button, CircularProgress, Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography
} from '@material-ui/core';
import UploadConfigurationDialog from "./UploadConfigurationDialog";
import ManualConfigurationDialog from "./ManualConfigurationDialog";
import CloseIcon from "@material-ui/icons/Close";

class LoginDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: true,
      username: '',
      password: '',
      showUploadConfigurationDialog: false,
      showManualConfigurationDialog: false,
      anchorEl: null,
      isAppConfigured: false,
      showAlert: false,
      showBackdrop: false
    };
    this.handleChangeName = this.handleChangeName.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleConfigurationClick = this.handleConfigurationClick.bind(this);
    this.closeUploadConfigurationDialog = this.closeUploadConfigurationDialog.bind(this);
    this.closeManualConfigurationDialog = this.closeManualConfigurationDialog.bind(this);
    this.showUploadConfigurationDialog = this.showUploadConfigurationDialog.bind(this);
    this.showManualConfigurationDialog = this.showManualConfigurationDialog.bind(this);
    this.canSubmit = this.canSubmit.bind(this);
    this.handleOpenMenu = this.handleOpenMenu.bind(this);
    this.handleCloseMenu = this.handleCloseMenu.bind(this);
  }

  handleChangeName(event) {
    this.setState({
      username: event.target.value
    });
  }

  handleChangePassword(event) {
    this.setState({
      password: event.target.value
    });
  }

  async componentDidMount() {
    await this.isAppConfigured();
  }

  async isAppConfigured() {
    await axios.get('/configuration')
        .then(res => {
          if (res.status === 204) {
            console.log('Application is not configured.');
            this.setState({isAppConfigured: false});
          }
          if (res.status === 200) {
            this.setState({isAppConfigured: true});
          }
        });
  }

  handleClose() {
    if (!this.state.isAppConfigured) {
      this.setState({showAlert: true});
    } else {
      this.setState({showBackdrop: true});
      axios({
        method: 'post',
        url: '/api/token',
        headers: {
          "Content-Type": "application/json"
        },
        data: {
          username: this.state.username,
          password: this.state.password,
        },
      }).then(() => {
        this.props.dispatch({type: "SET_USER_NAME", name: this.state.username});
        this.setState({open: false});
      }).catch(error => {
        alert("Error logging in: " + error);
        this.setState({open: true});
      }).finally(() => {
        this.setState({showBackdrop: false});
      })
    }
  }

  handleCancel() {
    this.setState({ open: false });
  }

  handleKeyDown(event) {
    if (event.keyCode === 13) {
      this.handleClose();
    }
  }

  canSubmit() {
    return this.state.username && this.state.password;
  }

  handleConfigurationClick() {
    console.log('Opening configuration dialog');
    this.setState({showConfigurationDialog: true});
  }

  async closeUploadConfigurationDialog() {
    console.log('Closing upload configuration dialog');
    this.setState({showUploadConfigurationDialog: false});
    await this.isAppConfigured();
  }

  async closeManualConfigurationDialog() {
    console.log('Closing manual configuration dialog');
    this.setState({showManualConfigurationDialog: false});
    await this.isAppConfigured();
  }

  handleOpenMenu(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleCloseMenu() {
    this.setState({ anchorEl: null });
  }

  showUploadConfigurationDialog() {
    this.setState({
      showUploadConfigurationDialog: true,
      showAlert: false
    });
    this.handleCloseMenu();
  }

  showManualConfigurationDialog() {
    this.setState({
      showManualConfigurationDialog: true,
      showAlert: false
    });
    this.handleCloseMenu();
  }

  render() {
    return (
      <div>
        <UploadConfigurationDialog open={this.state.showUploadConfigurationDialog} closeDialog={this.closeUploadConfigurationDialog}/>
        <ManualConfigurationDialog open={this.state.showManualConfigurationDialog} closeDialog={this.closeManualConfigurationDialog}/>
        <Dialog open={this.props.open} aria-labelledby="form-dialog-title" onKeyDown={this.handleKeyDown} maxWidth="xs">
          <DialogTitle id="form-dialog-title">
            <div className="login-dialog">
              Login
              <Tooltip
                  title={
                    <React.Fragment>
                      <Typography variant="subtitle1">Click here to configure the application</Typography>
                      <Typography variant="subtitle2">You can either upload a JSON file or manually edit the configuration.</Typography>
                      {<span style={{color: "yellow"}}><b>WARNING: You need to do this before you can log in to the application.</b></span>}
                    </React.Fragment>
                  }
              >
                <IconButton className="title-icon" onClick={event => this.handleOpenMenu(event)}>
                  <BuildIcon/>
                </IconButton>
              </Tooltip>
              <Menu
                  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                  getContentAnchorEl={null}
                  anchorEl={this.state.anchorEl}
                  keepMounted
                  open={Boolean(this.state.anchorEl)}
                  onClose={this.handleCloseMenu}>
                <MenuItem onClick={this.showUploadConfigurationDialog}>Upload JSON file</MenuItem>
                <MenuItem onClick={this.showManualConfigurationDialog}>Manually edit configuration</MenuItem>
              </Menu>
            </div>
          </DialogTitle>
          <DialogContent>
            <Collapse in={this.state.showAlert}>
              <Alert
                  severity="error"
                  action={
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                          this.setState({showAlert: false});
                        }}
                    >
                      <CloseIcon fontSize="inherit" />
                    </IconButton>
                  }
              >
                You must configure the application by clicking in the top right icon before you can log in.
              </Alert>
            </Collapse>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="User name"
              type="text"
              fullWidth
              onChange={this.handleChangeName}
            />
            <TextField
              margin="dense"
              id="password"
              label="Password"
              type="password"
              fullWidth
              onChange={this.handleChangePassword}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} disabled={!this.canSubmit()} variant="contained" color="primary">
              OK
            </Button>
          </DialogActions>
          <Backdrop style={{ zIndex: 9999 }} open={this.state.showBackdrop}>
            <CircularProgress color="inherit" />
          </Backdrop>
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = state => ({
})

export default connect(mapStateToProps)(LoginDialog);
