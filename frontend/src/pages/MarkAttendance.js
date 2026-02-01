import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useLanguage } from '../context/LanguageContext';
import { saveOfflineAttendance } from '../utils/offlineQueue';
import { MapPin, Camera, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import Webcam from 'react-webcam';

function MarkAttendance() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Location, 2: Selfie, 3: Success
    const webcamRef = React.useRef(null);
    const [selfie, setSelfie] = useState(null);

    // Get Location on Mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        accuracy: pos.coords.accuracy
                    });
                },
                (err) => toast.error('Location Access Required')
            );
        } else {
            toast.error('Geolocation not supported');
        }
    }, []);

    const handleCapture = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setSelfie(imageSrc);
    };

    const submitAttendance = async () => {
        if (!location || !selfie) return;
        setLoading(true);

        const payload = {
            location,
            selfie, // In real app, upload first and send URL
            timestamp: Date.now()
        };

        if (!navigator.onLine) {
            saveOfflineAttendance(payload);
            setLoading(false);
            setStep(3); // Show success (Offline)
            return;
        }

        try {
            // Mocking a successful backend call for now if endpoint not ready
            // await api.post('/attendance/mark', payload);

            // Simulating API delay
            await new Promise(r => setTimeout(r, 1000));

            setStep(3);
        } catch (err) {
            toast.error('Failed to mark attendance');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '600px', padding: '20px', paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'white', border: 'none', padding: '10px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                    <ArrowLeft size={24} color='#334155' />
                </button>
                <h2 style={{ margin: 0, color: '#1e293b' }}>Daily Attendance</h2>
            </div>

            {step === 1 && (
                <div className="glass-card text-center">
                    <div style={{ background: '#e0f2fe', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <MapPin size={40} color="#0284c7" />
                    </div>
                    {location ? (
                        <>
                            <h3 style={{ color: '#0284c7' }}>Location Locked 📍</h3>
                            <p className="text-muted">Accuracy: {location.accuracy?.toFixed(0)} meters</p>
                            <button className="btn btn-primary btn-block" onClick={() => setStep(2)}>
                                Next: verify Selfie
                            </button>
                        </>
                    ) : (
                        <>
                            <h3>Fetching Location...</h3>
                            <p className="text-muted">Please wait while we verify your site location.</p>
                            <div className="spinner" style={{ margin: '20px auto' }}></div>
                        </>
                    )}
                </div>
            )}

            {step === 2 && (
                <div className="glass-card">
                    <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>Take Selfie 📸</h3>
                    <div style={{ borderRadius: '15px', overflow: 'hidden', border: '2px solid #e2e8f0', marginBottom: '20px' }}>
                        {!selfie ? (
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                width="100%"
                                videoConstraints={{ facingMode: "user" }}
                            />
                        ) : (
                            <img src={selfie} alt="Selfie" style={{ width: '100%' }} />
                        )}
                    </div>

                    {!selfie ? (
                        <button className="btn btn-primary btn-block" onClick={handleCapture}>Capture Photo</button>
                    ) : (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSelfie(null)}>Retake</button>
                            <button className="btn btn-success" style={{ flex: 1 }} onClick={submitAttendance} disabled={loading}>
                                {loading ? 'Marking...' : 'Confirm ✅'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {step === 3 && (
                <div className="glass-card text-center" style={{ borderTop: '5px solid #22c55e' }}>
                    <CheckCircle size={60} color="#22c55e" style={{ marginBottom: '20px' }} />
                    <h2 style={{ color: '#22c55e' }}>Attendance Marked!</h2>
                    <p className="text-muted">
                        {navigator.onLine ? 'Synced with Server' : 'Saved Offline. Will sync later.'}
                    </p>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{new Date().toLocaleTimeString()}</p>
                    <button className="btn btn-primary btn-block" style={{ marginTop: '20px' }} onClick={() => navigate('/worker')}>
                        Back to Dashboard
                    </button>
                </div>
            )}
        </div>
    );
}

export default MarkAttendance;
