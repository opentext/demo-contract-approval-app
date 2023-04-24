import React from 'react';
import axios from 'axios';
import {
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper, Backdrop, CircularProgress, Snackbar
} from '@material-ui/core';

import ContractDetails from './ContractDetails';
import Pagination from './Pagination';
import DocumentDialogView from './DocumentDialogView';
import MuiAlert from "@material-ui/lab/Alert";
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import CloseIcon from "@material-ui/icons/Close";
import RiskClassification from './RiskClassification';

const baseUrl = process.env.REACT_APP_BASE_SERVICE_URL;

const Alert= (props) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

/**
 * This view displays all the contracts.
 */
export default class ContractList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      contracts: [],
      contractDetailsOpen: false,
      selectedContract: { properties: {} },
      pageNumber: 0,
      count: -1,
      openDocumentDialogView: false,
      fileId: '',
      fileName: '',
      showBackdrop: false,
      showSnackBar: false,
      snackBarMessage: '',
      snackBarSeverity: 'success'
    };

    this.handleCloseContractDetails = this.handleCloseContractDetails.bind(this);
    this.handleCloseDocumentDialogView = this.handleCloseDocumentDialogView.bind(this);
    this.handleSnackBarClose = this.handleSnackBarClose.bind(this);
  }

  componentDidMount() {
    this.getContracts();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.pageNumber !== this.state.pageNumber) {
      this.getContracts();
    }
  }

  handleCloseDocumentDialogView() {
    this.setState({ openDocumentDialogView: false })
  }

  openDocumentDialogView(fileId, fileName) {
    this.setState({
      openDocumentDialogView: true,
      fileId: fileId,
      fileName: fileName
    });
  }

  getContracts() {
    this.setState({ showBackdrop: true });
    axios({
      method: 'get',
      url: baseUrl + '/cms/instances/file/ca_contract/?include-total=true&sortby=create_time desc&page=' + (this.state.pageNumber + 1),
      headers: this.props.authContext.headers
    }).then(res => {
      this.setState({
        contracts: res.data && res.data._embedded ? res.data._embedded.collection : [],
        count: res.data.total
      });
    }).catch(error => {
      let errorMessage = 'Could not get contracts: ';
      if (error.response != null && error.response.data != null) {
        errorMessage += error.response.data.exception;
      } else {
        errorMessage += error.message;
      }
      this.raiseError(this, errorMessage);
    }).finally(() => {
      this.setState({ showBackdrop: false });
    })
  }

  showDetails(contract) {
    this.setState({
      selectedContract: contract,
      contractDetailsOpen: true
    });
  }

  getDateValue(dt) {
    return dt ? new Date(Date.parse(dt)).toLocaleString() : '';
  }

  handlePageNumber = (pageNumber) => {
    this.setState({ pageNumber: pageNumber });
  }

  handleCloseContractDetails() {
    this.setState({ contractDetailsOpen: false });
  }

  handleSnackBarClose() {
    this.setState({ showSnackBar: false });
  }

  raiseError(component, errorMessage) {
    component.setState({
      snackBarSeverity: 'error',
      snackBarMessage: errorMessage,
      showSnackBar: true
    });
  }

  render() {
    return (
      <div>
        <div className='content-header'>All contracts</div>

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
              {this.state.contracts.map((row) => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row">{row.name}</TableCell>
                  <TableCell align="left">{this.getDateValue(row.create_time)}</TableCell>
                  <TableCell align="left">{row.properties ? row.properties.status : ''}</TableCell>
                  <TableCell align="left">{row.properties ? row.properties.value : ''}</TableCell>
                  <TableCell align="left"><RiskClassification row={row} /></TableCell>
                  <TableCell align="left">
                    <Button size="small" variant="outlined" color="primary" onClick={() => { this.openDocumentDialogView(row.id, row.name) }}>Original</Button>
                  </TableCell>
                  <TableCell align="left">
                    <IconButton size="small" variant="outlined" color="primary" title="Show details" onClick={() => { this.showDetails(row) }}>
                      <ArrowForwardIosIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination pageNumber={this.state.pageNumber} count={this.state.count} handlePageNumber={this.handlePageNumber} />
        <ContractDetails open={this.state.contractDetailsOpen} selectedContract={this.state.selectedContract} parent={this} parentRaiseError={this.raiseError} onClose={this.handleCloseContractDetails} />
        <DocumentDialogView open={this.state.openDocumentDialogView} fileId={this.state.fileId} onClose={this.handleCloseDocumentDialogView} />
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
