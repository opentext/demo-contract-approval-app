import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { useAuth } from 'react-oidc-context';
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
  TableRow,
} from '@mui/material';
import { ArrowForwardIos, Close } from '@mui/icons-material';

import Alert from './Alert';
import Pagination from './Pagination';
import Tasks from '../services/workflow/Tasks';
import TaskDetails from './TaskDetails';
import DocumentDialogView from './DocumentDialogView';
import RiskClassification from './RiskClassification';

/**
 * This view displays the list of contracts pending for approval.
 */
function TasksList({ taskName }) {
  const { user } = useAuth();
  const [state, setState] = useState(
    {
      detailsOpen: false,
      selectedTask: { variables: [] },
      tasks: [],
      count: -1,
      pageNumber: 0,
      openDocumentDialogView: false,
      fileId: '',
      fileName: '',
      showBackdrop: false,
      showSnackBar: false,
      snackBarMessage: '',
      snackBarSeverity: 'success',
    },
  );

  const didMountRef = useRef(false);
  const pageNumberRef = useRef(state.pageNumber);

  const taskService = new Tasks(user, taskName);

  const getTasks = useCallback(() => {
    setState((prevState) => ({ ...prevState, showBackdrop: true }));
    taskService.getTasks(state.pageNumber * 10).then((res) => {
      if (res?.data?._embedded) {
        setState((prevState) => ({
          ...prevState,
          count: res.data.page.totalElements,
          tasks: res.data._embedded.tasks,
        }));
      } else {
        setState((prevState) => ({
          ...prevState,
          count: 0,
          tasks: [],
        }));
      }
    }).finally(() => {
      setState((prevState) => ({ ...prevState, showBackdrop: false }));
    });
  }, [
    state.pageNumber,
  ]);

  const onChangePage = (pageNumber) => {
    setState((prevState) => ({ ...prevState, pageNumber }));
  };

  const claimTask = (taskId) => {
    setState((prevState) => ({ ...prevState, showBackdrop: true }));
    taskService.claimTask(taskId)
      .then(() => {
        getTasks();
      });
  };

  const completeTask = (taskId, approve) => {
    setState((prevState) => ({ ...prevState, showBackdrop: true }));
    taskService.completeTask(taskId, approve)
      .then(() => {
        getTasks();
        setState((prevState) => ({
          ...prevState,
          snackBarMessage: `Contract ${(approve ? 'approved' : 'rejected')} successfully.`,
          showSnackBar: true,
        }));
      })
      .catch((error) => {
        let errorMessage = `Could not ${(approve ? 'approve ' : 'reject ')} task: `;
        if (error.response?.data) {
          errorMessage += error.response.data.exception;
        } else {
          errorMessage += error.message;
        }
        setState((prevState) => ({
          ...prevState,
          snackBarSeverity: 'error',
          snackBarMessage: errorMessage,
          showSnackBar: true,
        }));
      })
      .finally(() => {
        setState((prevState) => ({ ...prevState, showBackdrop: false }));
      });
  };

  const showDetails = (task) => {
    setState((prevState) => ({
      ...prevState,
      selectedTask: task,
      detailsOpen: true,
    }));
  };

  const getContractName = (task) => {
    if (task?.variables) {
      return task.variables.find((q) => q.name === 'contract').value.name;
    }
    return '';
  };

  const getContractValue = (task) => {
    if (task?.variables) {
      const found = task.variables.find((q) => q.name === 'contract');
      return found.value.properties?.value ?? '';
    }
    return '';
  };

  const getContract = (task) => {
    if (task?.variables) {
      const found = task.variables.find((q) => q.name === 'contract');
      return found.value.properties ? found.value : '';
    }
    return '';
  };

  const getDateValue = (task) => (task?.createTime ? new Date(Date.parse(task.createTime)).toLocaleString() : '');

  const handleCloseTaskDetails = () => {
    setState((prevState) => ({ ...prevState, detailsOpen: false }));
  };

  const handleCloseDocumentDialogView = () => {
    setState((prevState) => ({ ...prevState, openDocumentDialogView: false }));
  };

  const handleSnackBarClose = () => {
    setState((prevState) => ({ ...prevState, showSnackBar: false }));
  };

  const openDocumentDialogView = (fileId, fileName) => {
    setState((prevState) => ({
      ...prevState,
      openDocumentDialogView: true,
      fileId,
      fileName,
    }));
  };

  useEffect(() => {
    if (didMountRef.current) {
      if (pageNumberRef.current !== state.pageNumber) {
        getTasks();
      }
    } else {
      getTasks();
      didMountRef.current = true;
    }
  }, [state.addNumberOfContracts, state.pageNumber, getTasks]);

  return (
    <div>
      <div className="content-header">All Tasks</div>
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
            {state.tasks.map((row) => (
              <TableRow key={row.id}>
                <TableCell align="left">{getContractName(row)}</TableCell>
                <TableCell align="left">{getDateValue(row)}</TableCell>
                <TableCell align="left">{getContractValue(row)}</TableCell>
                <TableCell align="left"><RiskClassification row={getContract(row)} /></TableCell>
                <TableCell align="left">{row.assignee || ''}</TableCell>
                <TableCell align="left">
                  <Button size="small" variant="outlined" color="primary" onClick={() => openDocumentDialogView(getContract(row).id, getContractName(row))}>Original</Button>
                </TableCell>
                <TableCell align="left">
                  {
                    !row.assignee
                      ? <Button size="small" variant="outlined" color="primary" onClick={() => claimTask(row.id)}>Claim</Button>
                      : (
                        <ButtonGroup>
                          <Button size="small" variant="outlined" color="primary" onClick={() => completeTask(row.id, true)}>Approve</Button>
                          <Button size="small" variant="outlined" color="primary" onClick={() => completeTask(row.id, false)}>Reject</Button>
                        </ButtonGroup>
                      )
                  }
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" variant="outlined" color="primary" title="Show details" onClick={() => showDetails(row)}>
                    <ArrowForwardIos />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        pageNumber={state.pageNumber}
        count={state.count}
        handlePageNumber={onChangePage}
      />
      <TaskDetails
        open={state.detailsOpen}
        selectedTask={state.selectedTask}
        onClose={handleCloseTaskDetails}
      />
      <DocumentDialogView
        open={state.openDocumentDialogView}
        fileId={state.fileId}
        onClose={handleCloseDocumentDialogView}
      />
      <Backdrop style={{ zIndex: 9999 }} open={state.showBackdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={state.showSnackBar}
        autoHideDuration={5000}
        onClose={handleSnackBarClose}
        action={(
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackBarClose}>
            <Close fontSize="small" />
          </IconButton>
        )}
      >
        <Alert onClose={handleSnackBarClose} severity={state.snackBarSeverity}>
          {state.snackBarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

TasksList.propTypes = {
  taskName: PropTypes.string.isRequired,
};

export default TasksList;
