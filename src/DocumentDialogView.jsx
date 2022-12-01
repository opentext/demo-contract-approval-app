import React, { useState, useEffect, useRef } from 'react'
import {
	Dialog,
	DialogContent,
} from '@material-ui/core';

import {
	axios,
	useAuth
} from './authorization/ocpRestClient';
import FileViewer from "./FileViewer";

const baseUrl = process.env.REACT_APP_BASE_URL;

function DocumentDialogView({ fileId, open, onClose }) {
	const openRef = useRef(open);
	const [publicationData, setPublicationData] = useState('');
	const { authService } = useAuth();

	useEffect (() => {
		const getPublicationData = (fileId) => {
			let publicationData = "";
			axios({
				method: 'get',
				url: baseUrl + '/cms/instances/file/ca_contract/' + fileId + '/contents',
				headers: {
					Authorization: `Bearer ${authService.getAuthTokens().access_token}`
				}
			}).then((result) => {
				let blobId = "";
				if(result && result.data && result.data._embedded && result.data._embedded.collection) {
					let fileContents = result.data._embedded.collection;
					fileContents.forEach(content => {
						if(content.name === "Brava rendition"){
								blobId = content.blob_id;
						}
					});
				} 
				if (blobId) {
						axios({
							method: 'get',
							url: baseUrl + '/css/v2/content/' + blobId + '/download?avs-scan=false',
							headers: {
								Authorization: `Bearer ${authService.getAuthTokens().access_token}`
							}
						}).then((publicationResult)=>{
							if(publicationResult.data.status === "Complete") {
								publicationData = publicationResult;
								if(publicationData) {
									setPublicationData(publicationData.data);
								}
							}
					}).catch(error => {
						alert(error.response != null && error.response.data != null ? error.response.data : error.message);
					});
				}
			})
			.catch(error => {
				alert(error.response != null && error.response.data != null ? error.response.data : error.message);
			});
		};

		if (openRef.current !== open) {
			openRef.current = open;
			if (open) {
				getPublicationData(fileId);
			}
		}
	}, [authService, fileId, open]);

	return (
		<Dialog
			open={open}
			aria-labelledby="customized-dialog-title"
			fullScreen={true}
			maxWidth='md'>
			<DialogContent>
				<FileViewer
					closeDialog={onClose}
					publicationData={publicationData}
				/>
			</DialogContent>
		</Dialog>
	)
};

export default DocumentDialogView;
