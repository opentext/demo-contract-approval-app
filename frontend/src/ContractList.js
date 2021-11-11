import React from 'react';
import axios from 'axios';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
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
import CloseIcon from "@material-ui/icons/Close";
import RiskClassification from './RiskClassification';

function Alert(props) {
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
      downloadHref: '',
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

  openDocumentDialogView(downloadHref) {
    this.setState({
      openDocumentDialogView: true,
      downloadHref: downloadHref
    });
  }

  getContracts() {
    this.setState({ showBackdrop: true });
    axios({
      method: 'get',
      url: '/api/cms/instances/file/ot2_app_contract/?include-total=true&sortby=create_time desc&page=' + (this.state.pageNumber + 1),
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
      this.setState({
        snackBarSeverity: 'error',
        snackBarMessage: errorMessage,
        showSnackBar: true
      });
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
    this.setState({ contractDetailsOpen: false })
  }

  handleSnackBarClose() {
    this.setState({ showSnackBar: false });
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
                  <TableCell align="left">{row.properties ? row.properties.contract_status : ''}</TableCell>
                  <TableCell align="left">{row.properties ? row.properties.contract_value : ''}</TableCell>
                  <TableCell align="left"><RiskClassification row={row} /></TableCell>
                  <TableCell align="left">
                    <Button size="small" variant="outlined" color="primary" onClick={() => { this.openDocumentDialogView(row._links['urn:eim:linkrel:download-media'].href) }}>Original</Button>
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
        <ContractDetails open={this.state.contractDetailsOpen} selectedContract={this.state.selectedContract} onClose={this.handleCloseContractDetails} />
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
