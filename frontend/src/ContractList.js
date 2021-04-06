import React from 'react';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import axios from 'axios';
import ContractDetails from './ContractDetails';
import Pagination from './Pagination';
import DocumentDialogView from './DocumentDialogView';

	
export default class ContractList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      contracts: [],
      contractDetailsOpen: false,
      selectedContract: {properties:{}},
      pageNumber:0,
      count:-1,
      openDocumentDialogView: false,
	  downloadHref: ''
    };

    this.handleCloseContractDetails = this.handleCloseContractDetails.bind(this);
    this.handleCloseDocumentDialogView = this.handleCloseDocumentDialogView.bind(this);
  }

  componentDidMount(){
    this.getContracts();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.pageNumber !== this.state.pageNumber) {
      this.getContracts();
    }
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
    axios.defaults.baseURL = '';
    return axios({
      method: 'get',
      url: '/api/cms/instances/file/ot2_sign_contract/'+contract.id+'/contents',
    });
  }

  getContracts() {
    axios.defaults.baseURL = '';
      axios({
        method: 'get',
      url: '/api/cms/instances/file/ot2_sign_contract/?include-total=true&sortby=create_time desc&page='+(this.state.pageNumber+1),
      }).then(res => {
        this.setState({
          contracts: res.data && res.data._embedded ? res.data._embedded.collection : [],
          count: res.data.total
        });
    }).catch(error => {
      alert(error.message);
      });
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
	  this.setState({pageNumber: pageNumber});
  }

  handleCloseContractDetails() {
	  this.setState({contractDetailsOpen:false})
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
                  <TableCell align="left"></TableCell>
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
                      <Button size="small" variant="outlined" color="primary" onClick={() => {this.openDocumentDialogView(row._links['urn:eim:linkrel:download-media'].href)}}>Original</Button>
                      {row.properties.contract_status==="SIGNED" ?
                      <span>
                        <Button size="small" variant="outlined" color="primary" onClick={() => {this.openSignedDocument(row)}}>Signed</Button>
                        <Button size="small" variant="outlined" color="primary" onClick={() => {this.openDocumentLog(row)}}>Log</Button>
                      </span>
                      : row.properties.contract_status==="DECLINED" ?
                        <Button size="small" variant="outlined" color="primary" onClick={() => {this.openDocumentLog(row)}}>Log</Button>
                      : null
                      }
                    </TableCell>
                    <TableCell align="left">
                      <IconButton size="small" variant="outlined" color="primary" title="Show details" onClick={() => {this.showDetails(row)}}>
                        <ArrowForwardIosIcon/>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
	        <Pagination pageNumber={this.state.pageNumber} count={this.state.count} handlePageNumber={this.handlePageNumber}/>
        <ContractDetails open={this.state.contractDetailsOpen} selectedContract={this.state.selectedContract} onClose={this.handleCloseContractDetails}/>
        <DocumentDialogView open={this.state.openDocumentDialogView} downloadHref={this.state.downloadHref} onClose={this.handleCloseDocumentDialogView}/>
      </div>
      
    );
  }
}
