import React from 'react'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import axios from 'axios';
import PDFViewer from 'pdf-viewer-reactjs';


export default class DocumentDialogView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			document: { url: '', base64: '' },
			downloadHref: '',
			fileName: ''
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.open !== this.props.open) {
			if (this.props.open) {
				this.setState({
					downloadHref: this.props.downloadHref
				});
				this.downloadDocument(this.props.downloadHref);
			}
		}
	}

	closeDialog() {
		this.setState({
			document: { url: '', base64: '' },
			downloadHref: '',
			fileName: ''
		});
		this.props.onClose();
	}

	getContentId(url) {
		return url.replace(/^.*\/content\//, "");
	}

	downloadDocument(downloadHref) {
		axios.defaults.baseURL = '';
		axios({
			method: 'get',
			url: '/api/css/downloadcontent/' + this.getContentId(downloadHref),
			responseEncoding: 'binary',
			responseType: 'arraybuffer'
		}).then(file => {
			this.setState({
				document: { base64: new Buffer(file.data).toString('base64') },
			})
		}).catch(error => {
			alert("Error " + error.response.status + " in downloading: " + error.response.statusText);
		});
	}

	render() {
		if (this.state.document.base64) {
			return (
				<Dialog
					open={this.props.open}
					aria-labelledby="form-dialog-title"
					fullWidth={true}
					maxWidth='md'>
					<DialogTitle id="customized-dialog-title">{this.state.fileName}</DialogTitle>
					<DialogContent>
						<PDFViewer document={this.state.document} />
					</DialogContent>
					<DialogActions>
						<Button onClick={() => { this.closeDialog() }} variant="contained" color="primary">
							Close
					</Button>
					</DialogActions>
				</Dialog>
			)
		}
		else {
			return '';
		}

	}
}