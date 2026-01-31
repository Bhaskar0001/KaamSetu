import React, { useState, useEffect } from 'react';
import FaceCapture from '../components/FaceCapture'; // Reuse component
import { addToQueue, syncQueue } from '../utils/offlineSync';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

function MarkAttendance() {
    const { t, language, changeLanguage } = useLanguage();
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get('jobId');
    const [location, setLocation] = useState(null);
    const [selfie, setSelfie] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Try to sync on load if online
        window.addEventListener('online', syncQueue);
        syncQueue();

        // Get Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (err) => alert(t('location_permission'))
            );
        }

        return () => window.removeEventListener('online', syncQueue);
    }, []);

    const handleCapture = (path) => {
        setSelfie(path);
    };

    const submitAttendance = async () => {
        if (!location || !selfie || !jobId) {
            alert(t('missing_data'));
            return;
        }

        const payload = {
            jobId,
            lat: location.lat,
            lng: location.lng,
            selfieUrl: selfie,
            timestamp: Date.now()
        };

        if (navigator.onLine) {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                };
                await axios.post('http://localhost:5000/api/attendance/check-in', payload, config);
                alert(t('checkin_success'));
                navigate('/worker'); // Fixed redirect to worker dashboard
            } catch (err) {
                console.error(err);
                alert(t('error'));
            }
        } else {
            // Offline Fallback
            addToQueue('CHECK_IN', payload);
            alert(t('checkin_success') + ' (Offline Mode)');
            navigate('/worker');
        }
    };

    const toggleLang = () => {
        changeLanguage(language === 'en' ? 'hi' : 'en');
    };

    return (
        <>
            <section className='heading' style={{ position: 'relative' }}>
                <button
                    onClick={toggleLang}
                    className='btn btn-sm btn-outline'
                    style={{ position: 'absolute', right: 0, top: 0, background: 'white', color: 'black' }}
                >
                    {language === 'en' ? '🇮🇳 HI' : '🇺🇸 EN'}
                </button>
                <h1>{t('mark_attendance')}</h1>
                <p>{t('selfie_location')}</p>
            </section>

            <div className='form'>
                <div style={{ marginBottom: '20px' }}>
                    <strong>{t('location_status')}: </strong>
                    {location ? <span style={{ color: 'green' }}>{t('acquired')}</span> : <span style={{ color: 'red' }}>{t('acquiring')}</span>}
                </div>

                <FaceCapture onCapture={handleCapture} />

                {selfie && (
                    <button className='btn btn-block' onClick={submitAttendance} style={{ marginTop: '20px' }}>
                        {t('confirm_checkin')}
                    </button>
                )}
            </div>
        </>
    );
}

export default MarkAttendance;
