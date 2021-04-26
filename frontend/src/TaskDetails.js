import React from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@material-ui/core';

export default class TaskDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedTask: props.selectedTask
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.open !== this.props.open || prevProps.selectedTask !== this.props.selectedTask) {
      this.setState({
        selectedTask: this.props.selectedTask
      });
    }
  }

  closeDialog() {
    this.props.onClose();
  }

  getDateValue(dt) {
    return dt ? new Date(Date.parse(dt)).toLocaleString() : '';
  }

  getContractName(task) {
    if (task && task.variables[0]) {
      return task.variables.find(q => q.name === "cmsContract").value.name;
    }
    return "";
  }

  getRequesterEmail(task) {
    if (task && task.variables[0]) {
      return task.variables.find(q => q.name === "cmsContract").value.properties.contract_requester_email;
    }
    return "";
  }

  getContractValue(task) {
    if (task && task.variables[0]) {
      return task.variables.find(q => q.name === "cmsContract").value.properties.contract_value;
    }
    return "";
  }

  render() {
    return (
      <Dialog open={this.props.open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Task details</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            id="name"
            label="Task name"
            value={this.state.selectedTask.name}
            type="text"
            fullWidth
          />
          <TextField
            margin="dense"
            id="assignee"
            label="Assignee"
            value={this.state.selectedTask.assignee || ""}
            type="text"
            fullWidth
          />
          <TextField
            margin="dense"
            id="createTime"
            label="Creation date"
            value={this.getDateValue(this.state.selectedTask.createTime)}
            type="text"
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />
          <TextField
            margin="dense"
            id="cmsName"
            label="Contract name"
            value={this.getContractName(this.state.selectedTask)}
            type="text"
            fullWidth
          />
          <TextField
            margin="dense"
            id="cmsEmail"
            label="Requester email address"
            value={this.getRequesterEmail(this.state.selectedTask)}
            type="text"
            fullWidth
          />
          <TextField
            margin="dense"
            id="cmsValue"
            label="Contract value"
            value={this.getContractValue(this.state.selectedTask)}
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

