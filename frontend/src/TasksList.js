import React from 'react';
import {connect} from 'react-redux';
import {
  Backdrop,
  Button,
  ButtonGroup,
  CircularProgress,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@material-ui/core";
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import CloseIcon from "@material-ui/icons/Close";

import Pagination from './Pagination';
import Tasks from './services/workflow/Tasks';
import TaskDetails from './TaskDetails';
import DocumentDialogView from './DocumentDialogView';
import MuiAlert from "@material-ui/lab/Alert";
import RiskClassification from './RiskClassification';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

/**
 * This view displays the list of contracts pending for approval.
 */
class TasksList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      detailsOpen: false,
      selectedTask: { variables: [] },
      count: -1,
      page: 0,
      openDocumentDialogView: false,
      downloadHref: '',
      showBackdrop: false,
      showSnackBar: false,
      snackBarMessage: '',
      snackBarSeverity: 'success'
    };
    this.handleCloseTaskDetails = this.handleCloseTaskDetails.bind(this);
    this.onChangePage = this.onChangePage.bind(this);
    this.handleCloseDocumentDialogView = this.handleCloseDocumentDialogView.bind(this);
    this.handleSnackBarClose = this.handleSnackBarClose.bind(this);
  }

  componentDidMount() {
    this.taskService = new Tasks(this.props);
    this.getTasks();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.page !== this.state.page) {
      this.getTasks();
    }
  }

  getTasks() {
    this.setState({ showBackdrop: true });
    this.taskService.getTasks(this.state.page * 10).then(res => {
      if (res && res.data && res.data._embedded) {
        if (!res.data._links.next || res.data._embedded.tasks.length < 10) {
          this.setState({ count: this.state.page * 10 + res.data._embedded.tasks.length });
        }
        this.props.dispatch({ type: "SET_TASKS", tasks: res.data._embedded.tasks });
      } else {
        this.setState({ count: 0 });
        this.props.dispatch({ type: "SET_TASKS", tasks: [] });
      }
    }).finally(() => {
      this.setState({ showBackdrop: false });
    })
  }

  onChangePage(page) {
    this.setState({ page: page });
  }

  claimTask(taskId) {
    this.setState({ showBackdrop: true });
    this.taskService.claimTask(taskId)
      .then(() => {
        this.getTasks();
      })
  }

  completeTask(taskId, approve) {
    this.setState({ showBackdrop: true });
    this.taskService.completeTask(taskId, approve)
      .then(() => {
        this.getTasks();
        this.setState({
          snackBarMessage: 'Contract ' + (approve ? 'approved' : 'rejected') + ' successfully.',
          showSnackBar: true
        });
      })
      .catch(error => {
        let errorMessage = 'Could not ' + (approve ? 'approve ' : 'reject ') + 'task: ';
        if (error.response != null && error.response.data != null) {
          errorMessage += error.response.data.exception;
        } else {
          errorMessage += error.message;
        }
        this.setState({
          snackBarSeverity: 'error',
          snackBarMessage: errorMessage,
          showSnackBar: true
        });
      })
      .finally(() => {
        this.setState({ showBackdrop: false })
      });
  }

  showDetails(task) {
    this.setState({
      selectedTask: task,
      detailsOpen: true
    });
  }

  getContractName(task) {
    if (task && task.variables) {
      return task.variables.find((q) => q.name === "cmsContract").value.name;
    }
    return "";
  }

  getContractValue(task) {
    if (task && task.variables) {
      const found = task.variables.find((q) => q.name === "cmsContract");
      return found.value.properties ? found.value.properties.contract_value : "";
    }
    return "";
  }

  getContract(task) {
    if (task && task.variables) {
      const found = task.variables.find((q) => q.name === "cmsContract");
      return found.value.properties ? found.value : "";
    }
    return "";
  }

  getDateValue(task) {
    return task && task.createTime ? new Date(Date.parse(task.createTime)).toLocaleString() : '';
  }

  handleCloseTaskDetails() {
    this.setState({ detailsOpen: false })
  }

  handleCloseDocumentDialogView() {
    this.setState({ openDocumentDialogView: false })
  }

  handleSnackBarClose() {
    this.setState({ showSnackBar: false });
  }

  openDocumentDialogView(downloadHref) {
    this.setState({
      openDocumentDialogView: true,
      downloadHref: downloadHref
    });
  }

  render() {
    return (
      <div>
        <div className='content-header'>All Tasks</div>
        <TableContainer component={Paper}>
          <Table size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell align="left">Contract name</TableCell>
                <TableCell align="left">Creation date</TableCell>
                <TableCell align="left">Value</TableCell>
                <TableCell align="left">Risk classification</TableCell>
                <TableCell align="left">Assignee</TableCell>
                <TableCell align="left">View document</TableCell>
                <TableCell align="left">Action</TableCell>
                <TableCell align="center" />
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.tasks.map((row) => (
                <TableRow key={row.id}>
                  <TableCell align="left">{this.getContractName(row)}</TableCell>
                  <TableCell align="left">{this.getDateValue(row)}</TableCell>
                  <TableCell align="left">{this.getContractValue(row)}</TableCell>
                  <TableCell align="left"><RiskClassification row={this.getContract(row)} /></TableCell>
                  <TableCell align="left">{row.assignee || ""}</TableCell>
                  <TableCell align="left">
                    <Button size="small" variant="outlined" color="primary" onClick={() => { this.openDocumentDialogView(row.variables.find((q) => q.name === "contractDownloadLink").value) }}>Original</Button>
                  </TableCell>
                  <TableCell align="left">
                    {!row.assignee
                      ? <Button size="small" variant="outlined" color="primary" onClick={() => { this.claimTask(row.id) }}>Claim</Button>
                      : <ButtonGroup>
                        <Button size="small" variant="outlined" color="primary" onClick={() => { this.completeTask(row.id, true) }}>Approve</Button>
                        <Button size="small" variant="outlined" color="primary" onClick={() => { this.completeTask(row.id, false) }}>Reject</Button>
                      </ButtonGroup>
                    }
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" variant="outlined" color="primary" title="Show details" onClick={() => { this.showDetails(row) }}>
                      <ArrowForwardIosIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination pageNumber={this.state.page} count={this.state.count} handlePageNumber={this.onChangePage} />
        <TaskDetails open={this.state.detailsOpen} selectedTask={this.state.selectedTask} onClose={this.handleCloseTaskDetails} />
        <DocumentDialogView open={this.state.openDocumentDialogView} downloadHref={this.state.downloadHref} onClose={this.handleCloseDocumentDialogView} />
        <Backdrop style={{ zIndex: 9999 }} open={this.state.showBackdrop}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            open={this.state.showSnackBar}
            autoHideDuration={5000}
            onClose={this.handleSnackBarClose}
            action={
              <React.Fragment>
                <IconButton size="small" aria-label="close" color="inherit" onClick={this.handleSnackBarClose}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </React.Fragment>
            }
        >
          <Alert onClose={this.handleSnackBarClose} severity={this.state.snackBarSeverity}>
            {this.state.snackBarMessage}
          </Alert>
        </Snackbar>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  username: state.username,
  tasks: state.tasks
})

export default connect(mapStateToProps)(TasksList);
