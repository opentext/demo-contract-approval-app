import axios from 'axios';

class UploadFilesService {
    upload(file, onUploadProgress) {
        let formData = new FormData();

        formData.append("file", file);

        return axios.put("/configuration", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress: onUploadProgress,
        });
    }
}

export default new UploadFilesService();