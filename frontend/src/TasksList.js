import React from 'react';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Pagination from './Pagination';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { connect } from 'react-redux';
import Tasks from './services/workflow/Tasks';
import TaskDetails from './TaskDetails';
import DocumentDialogView from './DocumentDialogView';

class TasksList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      detailsOpen: false,
      selectedTask: {variables:[]},
      count: -1,
      page: 0,
      openDocumentDialogView: false,
      downloadHref: ''
    };
    this.handleCloseTaskDetails = this.handleCloseTaskDetails.bind(this);
    this.onChangePage = this.onChangePage.bind(this);
    this.handleCloseDocumentDialogView = this.handleCloseDocumentDialogView.bind(this);
  }

  componentDidMount(){
    this.taskService = new Tasks(this.props);
    this.getTasks();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.page !== this.state.page) {
      this.getTasks();
    }
  }

  getTasks() {
      this.taskService.getTasks(this.state.page*10).then(res => {
        if (res && res.data && res.data._embedded) {
          if (!res.data._links.next || res.data._embedded.tasks.length < 10) {
            this.setState({count: this.state.page*10 + res.data._embedded.tasks.length});
          }
          this.props.dispatch({type: "SET_TASKS", tasks: res.data._embedded.tasks});
        } else {
            this.setState({count: 0});
          this.props.dispatch({type: "SET_TASKS", tasks: []});
        }
      })
    }

  onChangePage(page) {
    this.setState({page: page});
  }

  claimTask(taskId) {
    let claimPromise = this.taskService.claimTask(taskId);
    claimPromise.then(res => {
      this.getTasks();
    })
  }

  completeTask(taskId, approve) {
    this.taskService.completeTask(taskId, approve).then(res => {
      this.getTasks();
    })
  }

  showDetails(task) {
    this.setState({
      selectedTask: task,
      detailsOpen: true
    });
  }

  getContractName(task) {
    if (task && task.variables) {
      return task.variables.find((q) => q.name==="cmsContract").value.name;
    }
    return "";
  }

  getContractValue(task) {
    if (task && task.variables) {
      return task.variables.find((q) => q.name==="cmsContract").value.properties.contract_value;
    }
    return "";
  }
  
  getDateValue(task) {
    return task && task.createTime ? new Date(Date.parse(task.createTime)).toLocaleString() : '';
  }

  handleCloseTaskDetails() {
	  this.setState({detailsOpen:false})
  }
  
  handleCloseDocumentDialogView() {
	  this.setState({openDocumentDialogView: false})
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
                  <TableCell align="left">Contract value</TableCell>
                  <TableCell align="left">Assignee</TableCell>
                  <TableCell align="left">View document</TableCell>
                  <TableCell align="left">Action</TableCell>
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.props.tasks.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell align="left">{this.getContractName(row)}</TableCell>
                    <TableCell align="left">{this.getDateValue(row)}</TableCell>
                    <TableCell align="left">{this.getContractValue(row)}</TableCell>
                    <TableCell align="left">{row.assignee || ""}</TableCell>
                    <TableCell align="left">
                      <Button size="small" variant="outlined" color="primary" onClick={() => {this.openDocumentDialogView(row.variables.find((q) => q.name==="contractDownloadLink").value)}}>Original</Button>
                    </TableCell>
                    <TableCell align="left">
                      {!row.assignee 
                        ?  <Button size="small" variant="outlined" color="primary" onClick={() => {this.claimTask(row.id)}}>Claim</Button>
                        :  <ButtonGroup>
                            <Button size="small" variant="outlined" color="primary" onClick={() => {this.completeTask(row.id, true)}}>Approve</Button>
                            <Button size="small" variant="outlined" color="primary" onClick={() => {this.completeTask(row.id, false)}}>Reject</Button>
                           </ButtonGroup>
                      }
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" variant="outlined" color="primary" title="Show details" onClick={() => {this.showDetails(row)}}>
                        <ArrowForwardIosIcon/>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination pageNumber={this.state.page} count={this.state.count} handlePageNumber={this.onChangePage}/>
          <TaskDetails open={this.state.detailsOpen} selectedTask={this.state.selectedTask} onClose={this.handleCloseTaskDetails}/>
          <DocumentDialogView open={this.state.openDocumentDialogView} downloadHref={this.state.downloadHref} onClose={this.handleCloseDocumentDialogView}/>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  username: state.username,
  tasks: state.tasks
})

export default connect(mapStateToProps)(TasksList);