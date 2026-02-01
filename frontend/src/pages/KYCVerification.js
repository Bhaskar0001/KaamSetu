import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Camera, Upload, CheckCircle, ShieldCheck, UserCheck } from 'lucide-react';

function KYCVerification() {
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const [step, setStep] = useState(1); // 1: Upload Aadhaar, 2: Selfie, 3: Processing
    const [aadhaarFile, setAadhaarFile] = useState(null);
    const [selfieImg, setSelfieImg] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setAadhaarFile(e.target.files[0]);
        }
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setSelfieImg(imageSrc);
    }, [webcamRef]);

    const dataURLtoFile = (dataurl, filename) => {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }

    const handleSubmit = async () => {
        setStep(3);
        setUploading(true);

        const formData = new FormData();
        formData.append('aadhaarFront', aadhaarFile);

        // Convert base64 selfie to file
        const selfieFile = dataURLtoFile(selfieImg, 'selfie.jpg');
        formData.append('selfie', selfieFile);

        try {
            const res = await api.post('/auth/kyc-upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('✅ KYC Verified Successfully!');

            // Update local user
            localStorage.setItem('user', JSON.stringify(res.data.data));

            setTimeout(() => {
                navigate('/worker'); // Or relevant dashboard
            }, 2000);

        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification Failed');
            setStep(2); // Go back to retry
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '600px', padding: '20px' }}>
            <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
                <ShieldCheck size={50} color="#0ea5e9" style={{ marginBottom: '20px' }} />
                <h2 style={{ marginBottom: '10px' }}>Digital KYC Verification</h2>
                <p className="text-muted" style={{ marginBottom: '30px' }}>
                    Verify your identity to access jobs. (अपनी पहचान सत्यापित करें)
                </p>

                {/* Stepper */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: step >= 1 ? '#0ea5e9' : '#e2e8f0' }}></div>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: step >= 2 ? '#0ea5e9' : '#e2e8f0' }}></div>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: step >= 3 ? '#22c55e' : '#e2e8f0' }}></div>
                </div>

                {step === 1 && (
                    <div className="animate-fade-in">
                        <h4>Step 1: Upload Aadhaar Card (Front)</h4>
                        <div style={{ border: '2px dashed #cbd5e1', padding: '40px', borderRadius: '15px', marginTop: '20px', cursor: 'pointer', background: '#f8fafc' }} onClick={() => document.getElementById('aadhaarInput').click()}>
                            {aadhaarFile ? (
                                <div>
                                    <CheckCircle size={40} color="#22c55e" style={{ margin: '0 auto 10px' }} />
                                    <p>{aadhaarFile.name}</p>
                                    <p className="text-muted" style={{ fontSize: '0.8rem' }}>Click to change</p>
                                </div>
                            ) : (
                                <div>
                                    <Upload size={40} color="#64748b" style={{ margin: '0 auto 10px' }} />
                                    <p>Tap to Upload Card Photo</p>
                                </div>
                            )}
                            <input id="aadhaarInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                        </div>
                        <button className="btn btn-primary btn-block" style={{ marginTop: '20px' }} disabled={!aadhaarFile} onClick={() => setStep(2)}>
                            Next <UserCheck size={18} style={{ marginLeft: '8px' }} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in">
                        <h4>Step 2: Take a Selfie (Live)</h4>
                        <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '15px' }}>Make sure your face is clearly visible.</p>

                        <div style={{ borderRadius: '15px', overflow: 'hidden', marginBottom: '20px', border: '4px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            {!selfieImg ? (
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    width="100%"
                                    videoConstraints={{ facingMode: "user" }}
                                />
                            ) : (
                                <img src={selfieImg} alt="Selfie" style={{ width: '100%' }} />
                            )}
                        </div>

                        {!selfieImg ? (
                            <button className="btn btn-primary" onClick={capture} style={{ width: '60px', height: '60px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                                <Camera size={28} />
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn" style={{ flex: 1, background: '#e2e8f0', color: '#475569' }} onClick={() => setSelfieImg(null)}>Retake</button>
                                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit}>Verify Now ✨</button>
                            </div>
                        )}
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-fade-in" style={{ padding: '40px 0' }}>
                        <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
                        <h3>Verifying Identity...</h3>
                        <p className="text-muted">Matching Face with Aadhaar Card (AI)</p>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '10px' }}>This may take a few seconds...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default KYCVerification;
