import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import axios from 'axios';
import { useAuth } from 'react-oidc-context';
import {
  Backdrop,
  Button,
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
  TextField,
} from '@mui/material';
import { ArrowForwardIos, Close } from '@mui/icons-material';

import Alert from './Alert';
import ContractDetails from './ContractDetails';
import DocumentDialogView from './DocumentDialogView';
import Pagination from './Pagination';
import RiskClassification from './RiskClassification';

const baseUrl = process.env.REACT_APP_BASE_SERVICE_URL;

/**
 * This view displays all the contracts.
 */
function ContractList() {
  const { user } = useAuth();
  const [state, setState] = useState(
    {
      contracts: [],
      openContractDetails: false,
      selectedContract: { properties: {} },
      pageNumber: 0,
      count: -1,
      openDocumentDialogView: false,
      fileId: '',
      fileName: '',
      showBackdrop: false,
      showSnackBar: false,
      snackBarMessage: '',
      snackBarSeverity: 'success',
      filters: {
        name: '',
        status: '',
      },
    },
  );
  const didMountRef = useRef(false);
  const pageNumberRef = useRef(state.pageNumber);

  const raiseError = useCallback((errorMessage) => {
    setState((prevState) => ({
      ...prevState,
      snackBarSeverity: 'error',
      snackBarMessage: errorMessage,
      showSnackBar: true,
    }));
  }, []);

  const buildFilterParam = (filterName, filterValue) => `LOWER(${filterName}) like '%${encodeURIComponent(filterValue).toLocaleLowerCase()}%'`;

  const getContracts = useCallback(() => {
    setState((prevState) => ({ ...prevState, showBackdrop: true }));
    const filterParams = [];
    if (state.filters.name) {
      filterParams.push(buildFilterParam('name', state.filters.name));
    }
    if (state.filters.status) {
      filterParams.push(buildFilterParam('status', state.filters.status));
    }
    const query = filterParams.length > 0 ? `&filter=${filterParams.join(' and ')}` : '';
    axios({
      method: 'get',
      url: `${baseUrl}/cms/instances/file/ca_contract/?include-total=true&sortby=create_time desc&page=${state.pageNumber + 1}${query}`,
      headers: {
        Authorization: `Bearer ${user.access_token}`,
      },
    }).then((res) => {
      setState((prevState) => ({
        ...prevState,
        contracts: res.data?._embedded?.collection ?? [],
        count: res.data.total,
      }));
    }).catch((error) => {
      let errorMessage = 'Could not get contracts: ';
      if (error.response?.data) {
        errorMessage += error.response.data.exception;
      } else {
        errorMessage += error.message;
      }
      raiseError(this, errorMessage);
    }).finally(() => {
      setState((prevState) => ({ ...prevState, showBackdrop: false }));
    });
  }, [raiseError, user.access_token, state.pageNumber, state.filters]);

  const handleCloseDocumentDialogView = () => {
    setState((prevState) => ({ ...prevState, openDocumentDialogView: false }));
  };

  const openDocumentDialogView = (fileId, fileName) => {
    setState((prevState) => ({
      ...prevState,
      openDocumentDialogView: true,
      fileId,
      fileName,
    }));
  };

  const showDetails = (contract) => {
    setState((prevState) => ({
      ...prevState,
      selectedContract: contract,
      openContractDetails: true,
    }));
  };

  const getDateValue = (dt) => (dt ? new Date(Date.parse(dt)).toLocaleString() : '');

  const handlePageNumber = (pageNumber) => {
    setState((prevState) => ({ ...prevState, pageNumber }));
  };

  const handleCloseContractDetails = () => {
    setState((prevState) => ({ ...prevState, openContractDetails: false }));
  };

  const handleSnackBarClose = () => {
    setState((prevState) => ({ ...prevState, showSnackBar: false }));
  };

  useEffect(() => {
    if (didMountRef.current) {
      if (pageNumberRef.current !== state.pageNumber) {
        getContracts();
        pageNumberRef.current = state.pageNumber;
      }
    } else {
      getContracts();
      didMountRef.current = true;
    }
  }, [state.pageNumber, getContracts]);

  return (
    <div>
      <div style={{ margin: '1rem' }}>
        <TextField
          label="Contract Name"
          size="small"
          value={state.filters.name}
          onChange={(e) => setState((prevState) => ({
            ...prevState,
            filters: { ...prevState.filters, name: e.target.value },
          }))}
        />
        {' '}
        <TextField
          label="Status"
          size="small"
          value={state.filters.status}
          onChange={(e) => setState((prevState) => ({
            ...prevState,
            filters: { ...prevState.filters, status: e.target.value },
          }))}
        />
        <Button
          color="primary"
          onClick={() => getContracts()}
        >
          Apply Filters
        </Button>
      </div>
      <div className="content-header">All contracts</div>
      <TableContainer component={Paper}>
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Contract name</TableCell>
              <TableCell align="left">Creation date</TableCell>
              <TableCell align="left">Status</TableCell>
              <TableCell align="left">Value</TableCell>
              <TableCell align="left">Risk classification</TableCell>
              <TableCell align="left">View document</TableCell>
              <TableCell align="left" />
            </TableRow>
          </TableHead>
          <TableBody>
            {state.contracts.map((row) => (
              <TableRow key={row.id}>
                <TableCell component="th" scope="row">{row.name}</TableCell>
                <TableCell align="left">{getDateValue(row.create_time)}</TableCell>
                <TableCell align="left">{row.properties?.status ?? ''}</TableCell>
                <TableCell align="left">{row.properties?.value ?? ''}</TableCell>
                <TableCell align="left"><RiskClassification row={row} /></TableCell>
                <TableCell align="left">
                  <Button size="small" variant="outlined" color="primary" onClick={() => openDocumentDialogView(row.id, row.name)}>Original</Button>
                </TableCell>
                <TableCell align="left">
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
        handlePageNumber={handlePageNumber}
      />
      <ContractDetails
        open={state.openContractDetails}
        selectedContract={state.selectedContract}
        parentRaiseError={raiseError}
        onClose={handleCloseContractDetails}
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
        action={
          (
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackBarClose}>
              <Close fontSize="small" />
            </IconButton>
          )
        }
      >
        <Alert onClose={handleSnackBarClose} severity={state.snackBarSeverity}>
          {state.snackBarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ContractList;
