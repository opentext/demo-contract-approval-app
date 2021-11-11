import React from 'react'
import axios from 'axios';
import PDFViewer from 'pdf-viewer-reactjs';
import {
	Backdrop,
	Button, CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle
} from '@material-ui/core';

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
		// Calling /api/css/downloadcontent
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
			return (
				<Backdrop style={{zIndex: 9999}} open={this.props.open}>
					<CircularProgress color="inherit"/>
				</Backdrop>
			)
		}

	}
}
