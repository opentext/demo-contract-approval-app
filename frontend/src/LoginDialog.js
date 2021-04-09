import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import axios from 'axios';
import { connect } from 'react-redux';

class LoginDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: true,
      username: '',
      password: ''
    };
    this.handleChangeName = this.handleChangeName.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleChangeName(event) {
    this.setState({
      username: event.target.value
    });
  };
  handleChangePassword(event) {
    this.setState({
      password: event.target.value
    });
  };

  handleClose() {
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
   });
  };

  handleCancel() {
    this.setState({open: false});
  };

  handleKeyDown(event) {
    if (event.keyCode === 13) {
      this.handleClose();
    }
  };

  render() {
    return (
      <div>
        <Dialog open={this.props.open} aria-labelledby="form-dialog-title" onKeyDown={this.handleKeyDown}>
          <DialogTitle id="form-dialog-title">Login</DialogTitle>
          <DialogContent>
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
            <Button onClick={this.handleCancel} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleClose} variant="contained" color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = state => ({
})

export default connect(mapStateToProps)(LoginDialog);
