import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'user',
};

const FaceCapture = ({ onCapture }) => {
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [uploading, setUploading] = useState(false);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
    }, [webcamRef]);

    const retake = () => {
        setImgSrc(null);
    };

    const uploadImage = async () => {
        if (!imgSrc) return;

        setUploading(true);

        // Convert base64 to blob
        const base64Response = await fetch(imgSrc);
        const blob = await base64Response.blob();

        const formData = new FormData();
        formData.append('image', blob, 'face-capture.jpg');

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            const res = await axios.post('http://localhost:5000/api/upload', formData, config);
            onCapture(res.data.filePath);
            setUploading(false);
            alert('Face registered successfully!');
        } catch (error) {
            console.error(error);
            setUploading(false);
            alert('Failed to upload face image');
        }
    };

    return (
        <div className="face-capture-container">
            {imgSrc ? (
                <img src={imgSrc} alt="captured" style={{ width: '100%', borderRadius: '10px' }} />
            ) : (
                <Webcam
                    audio={false}
                    height={300}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width="100%"
                    videoConstraints={videoConstraints}
                    style={{ borderRadius: '10px' }}
                />
            )}

            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                {imgSrc ? (
                    <>
                        <button type="button" onClick={retake} className="btn">
                            Retake
                        </button>
                        <button type="button" onClick={uploadImage} className="btn" disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Confirm Photo'}
                        </button>
                    </>
                ) : (
                    <button type="button" onClick={capture} className="btn">
                        Capture Photo
                    </button>
                )}
            </div>
        </div>
    );
};

export default FaceCapture;
