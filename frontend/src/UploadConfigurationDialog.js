import React from 'react';
import {connect} from 'react-redux';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    LinearProgress,
    ListItem,
    Typography
} from '@material-ui/core';
import UploadFilesService from "./services/UploadFilesService";

class UploadConfigurationDialog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            selectedFiles: undefined,
            currentFile: undefined,
            progress: 0,
            message: "",
            isError: false,
            completed: false
        };
        this.selectFile = this.selectFile.bind(this);
        this.upload = this.upload.bind(this);
        this.resetDialog = this.resetDialog.bind(this);
    }

    selectFile(event) {
        this.setState({
            selectedFiles: event.target.files,
            completed: false
        });
    }

    upload() {
        console.log('Uploading file...');
        let currentFile = this.state.selectedFiles[0];

        this.setState({
            progress: 0,
            currentFile: currentFile,
        });

        UploadFilesService.upload(currentFile, (event) => {
            this.setState({
                progress: Math.round((100 * event.loaded) / event.total),
            });
        })
            .then((response) => {
                this.setState({
                    message: response.data.message,
                    isError: false,
                    completed: true
                });
            })
            .catch(() => {
                this.setState({
                    progress: 0,
                    message: "Could not upload the file!",
                    currentFile: undefined,
                    isError: true
                });
            });

        this.setState({
            selectedFiles: undefined,
        });
    }

    resetDialog() {
        this.props.closeDialog();
        this.setState({
            open: false,
            selectedFiles: undefined,
            currentFile: undefined,
            progress: 0,
            message: "",
            isError: false,
            completed: false
        });
    }

    render() {
        const {
            selectedFiles,
            currentFile,
            progress,
            message,
            fileInfos,
            isError
        } = this.state;
        return (
            <div>
                <Dialog open={this.props.open} aria-labelledby="form-dialog-title" fullWidth={true}>
                    <div className="configuration-dialog">
                    <DialogTitle id="form-dialog-title">Upload configuration</DialogTitle>
                    <DialogContent>
                        <Typography variant="subtitle2">
                            You can upload the configuration file you can download from the OT2 console.
                        </Typography>
                        <Typography variant="subtitle2">
                            This file is typically named ot2_config.json.
                        </Typography>
                            {currentFile && (
                                <Box style={{marginBottom:25}} display="flex" alignItems="center">
                                    <Box width="100%" mr={1}>
                                        <LinearProgress variant="determinate" value={progress} />
                                    </Box>
                                    <Box minWidth={35}>
                                        <Typography variant="body2" color="textSecondary">{`${progress}%`}</Typography>
                                    </Box>
                                </Box>)
                            }
                            <div className="top-margin">
                                <label htmlFor="btn-upload">
                                    <input
                                        id="btn-upload"
                                        name="btn-upload"
                                        style={{ display: 'none' }}
                                        type="file"
                                        onChange={this.selectFile} />
                                    <Button
                                        style={{marginRight: 10}}
                                        variant="contained"
                                        color={this.state.selectedFiles || this.state.completed ? '' : 'primary'}
                                        component="span" >
                                        Select File
                                    </Button>
                                </label>
                                <div style={{overflow: "hidden",textOverflow: "ellipsis",whiteSpace: "nowrap", display: "inline-block",maxWidth: 300,verticalAlign: "middle"}}>
                                    {selectedFiles && selectedFiles.length > 0 ? selectedFiles[0].name : null}
                                </div>
                                <Button
                                    style={{position: "absolute", right: 30}}
                                    color="primary"
                                    variant="contained"
                                    component="span"
                                    disabled={!selectedFiles}
                                    onClick={this.upload}>
                                    Upload
                                </Button>
                            </div>
                            <div className="top-margin">
                                <Typography variant="subtitle2" className={`message ${isError ? "error" : ""}`}>
                                    {message}
                                </Typography>
                            </div>
                            <ul className="list-group">
                                {fileInfos &&
                                fileInfos.map((file, index) => (
                                    <ListItem
                                        divider
                                        key={index}>
                                        <a href={file.url}>{file.name}</a>
                                    </ListItem>
                                ))}
                            </ul>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.resetDialog} color="primary">
                            Cancel
                        </Button>
                        <Button
                            onClick={this.resetDialog}
                            disabled={!this.state.completed}
                            variant="contained"
                            color={this.state.completed ? 'primary' : ''}>
                            Close
                        </Button>
                    </DialogActions>
                    </div>
                </Dialog>
            </div>
        );
    }
}

const mapStateToProps = state => ({
})

export default connect(mapStateToProps)(UploadConfigurationDialog);
