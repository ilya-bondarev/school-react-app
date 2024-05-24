import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import config from '../config';

const ProfilePhotoUpload = ({ onFileUpload }) => {
    const [fileName, setFileName] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        const formData = new FormData();
        formData.append('file', file);

        axios.post(`${config.apiBaseUrl}/upload-profile-photo/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(response => {
            setFileName(response.data.filename);
            if (onFileUpload) {
                onFileUpload(response.data.filename);
            }
        })
        .catch(error => {
            console.error('Error uploading file:', error);
        });
    }, [onFileUpload]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: 'image/jpeg, image/png, image/gif',
        multiple: false
    });

    return (
        <div {...getRootProps({ className: 'dropzone' })} style={{ border: '2px dashed #0087F7', padding: '20px', textAlign: 'center' }}>
            <input {...getInputProps()} />
            <p>Drag & drop a profile photo here, or click to select one</p>
            <button type="button">Browse</button>
        </div>
    );
};

export default ProfilePhotoUpload;
