import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import api from '../utils/api'; // Unused
import { toast } from 'react-toastify';
import { useLanguage } from '../context/LanguageContext';
import { saveOfflineAttendance } from '../utils/offlineQueue';
import { MapPin, ArrowLeft } from 'lucide-react';
import Webcam from 'react-webcam';
import ActionSuccess from '../components/ActionSuccess';

function MarkAttendance() {
    const { t, language, changeLanguage } = useLanguage();
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
                <h2 style={{ margin: 0, color: '#1e293b' }}>{t('daily_attendance')}</h2>
                <button onClick={() => changeLanguage(language === 'en' ? 'hi' : 'en')} style={{ marginLeft: 'auto', background: '#e2e8f0', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {language === 'en' ? '🇮🇳 HI' : '🇺🇸 EN'}
                </button>
            </div>

            {step === 1 && (
                <div className="glass-card text-center">
                    <div style={{ background: '#e0f2fe', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <MapPin size={40} color="#0284c7" />
                    </div>
                    {location ? (
                        <>
                            <h3 style={{ color: '#0284c7' }}>{t('location_locked')}</h3>
                            <p className="text-muted">{t('accuracy')}: {location.accuracy?.toFixed(0)} {t('meters')}</p>
                            <button className="btn btn-primary btn-block" onClick={() => setStep(2)}>
                                {t('next_verify_selfie')}
                            </button>
                        </>
                    ) : (
                        <>
                            <h3>{t('fetching_location')}</h3>
                            <p className="text-muted">{t('verify_site_location')}</p>
                            <div className="spinner" style={{ margin: '20px auto' }}></div>
                        </>
                    )}
                </div>
            )}

            {step === 2 && (
                <div className="glass-card">
                    <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>{t('take_selfie')}</h3>
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
                        <button className="btn btn-primary btn-block" onClick={handleCapture}>{t('capture_photo')}</button>
                    ) : (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSelfie(null)}>{t('retake')}</button>
                            <button className="btn btn-success" style={{ flex: 1 }} onClick={submitAttendance} disabled={loading}>
                                {loading ? t('marking') : t('confirm')}
                            </button>
                        </div>
                    )}
                </div>
            )}

            <ActionSuccess
                isOpen={step === 3}
                message={t('attendance_marked')}
                subMessage={navigator.onLine ? t('synced_with_server') : t('saved_offline')}
                onClose={() => navigate('/worker')}
            />
        </div>
    );
}

export default MarkAttendance;
