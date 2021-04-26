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
  Paper, Backdrop, CircularProgress
} from '@material-ui/core';

import ContractDetails from './ContractDetails';
import Pagination from './Pagination';
import DocumentDialogView from './DocumentDialogView';

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
      showBackdrop: false
    };

    this.handleCloseContractDetails = this.handleCloseContractDetails.bind(this);
    this.handleCloseDocumentDialogView = this.handleCloseDocumentDialogView.bind(this);
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

  openSignedDocument(contract) {
    this.getContractDetails(contract).then((res) => {
      let href = res.data._embedded.collection.find((q) => q.name.endsWith('_signed'))._links['urn:eim:linkrel:download-media'].href;
      this.openDocumentDialogView(href);
    })
  }

  openDocumentLog(contract) {
    this.getContractDetails(contract).then((res) => {
      let href = res.data._embedded.collection.find((q) => q.name.endsWith('_signing_log'))._links['urn:eim:linkrel:download-media'].href;
      this.openDocumentDialogView(href);
    })

  }

  getContractDetails(contract) {
    return axios({
      method: 'get',
      url: '/api/cms/instances/file/ot2_app_contract/' + contract.id + '/contents',
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
      alert(error.response != null && error.response.data != null ? error.response.data : error.message);
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
                <TableCell align="left">View document</TableCell>
                <TableCell align="left" />
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.contracts.map((row) => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row">{row.name}</TableCell>
                  <TableCell align="left">{this.getDateValue(row.create_time)}</TableCell>
                  <TableCell align="left">{row.properties.contract_status}</TableCell>
                  <TableCell align="left">{row.properties.contract_value}</TableCell>
                  <TableCell align="left">
                    <Button size="small" variant="outlined" color="primary" onClick={() => { this.openDocumentDialogView(row._links['urn:eim:linkrel:download-media'].href) }}>Original</Button>
                    {row.properties.contract_status === "SIGNED" ?
                      <span>
                        <Button size="small" variant="outlined" color="primary" onClick={() => { this.openSignedDocument(row) }}>Signed</Button>
                        <Button size="small" variant="outlined" color="primary" onClick={() => { this.openDocumentLog(row) }}>Log</Button>
                      </span>
                      : row.properties.contract_status === "DECLINED" ?
                        <Button size="small" variant="outlined" color="primary" onClick={() => { this.openDocumentLog(row) }}>Log</Button>
                        : null
                    }
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
      </div>

    );
  }
}
