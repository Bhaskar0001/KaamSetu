import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import VoiceAssistant from '../components/VoiceAssistant';
import FaceCapture from '../components/FaceCapture';
import api from '../utils/api';
import { toast } from 'react-toastify';
import Skeleton from '../components/Skeleton';
import { useLanguage } from '../context/LanguageContext';

function WorkerProfile() {
    const { t, language, changeLanguage } = useLanguage();
    // Redux User (Auth)
    const { user: authUser } = useSelector((state) => state.auth);

    // Local State
    const [user, setUser] = useState(authUser || {});
    const [loading, setLoading] = useState(true);
    const [aadhaarInput, setAadhaarInput] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        name: authUser?.name || '',
        skills: authUser?.skills || [],
        locationAddress: authUser?.location?.address || '',
        experience: authUser?.experience || '',
        faceData: authUser?.faceData || '',
    });

    const [step, setStep] = useState(1); // 1: Info, 2: Face

    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data.data);
            // Update form data with latest
            setFormData(prev => ({
                ...prev,
                name: res.data.data.name,
                skills: res.data.data.skills || [],
                faceData: res.data.data.faceData
            }));
        } catch (err) {
            toast.error(t('error'));
        } finally {
            setLoading(false);
        }
    };

    const handleVoiceInput = (text) => {
        // Simple logic: if text matches a skill, add it? Or set name?
        // For now let's assume it sets the Name if in step 1
        if (step === 1) {
            setFormData(prev => ({ ...prev, name: text }));
            toast.info(`Voice Input: ${text}`);
        }
    };

    const handleVerifyParams = async (e) => {
        e.preventDefault();
        if (aadhaarInput.length !== 12) {
            toast.warning('Please enter valid 12-digit Aadhaar number');
            return;
        }

        setIsVerifying(true);
        try {
            const res = await api.post('/auth/verify-identity', { aadhaarNumber: aadhaarInput });
            toast.success('✅ ' + t('success'));
            setUser(res.data.data);
            setAadhaarInput('');
        } catch (err) {
            toast.error(err.response?.data?.message || t('error'));
        } finally {
            setIsVerifying(false);
        }
    };

    const handleFaceCapture = (imgSrc) => {
        setFormData(prev => ({ ...prev, faceData: imgSrc }));
    };

    const onSubmit = async () => {
        // Here we would call API to update profile
        toast.success(t('success'));
        navigate('/worker');
    };

    const toggleLang = () => {
        changeLanguage(language === 'en' ? 'hi' : 'en');
    };

    if (loading) {
        return (
            <div className='container'>
                <Skeleton height="200px" style={{ marginBottom: '20px' }} />
                <Skeleton height="300px" />
            </div>
        );
    }

    return (
        <div className='container'>
            <section className='heading' style={{ position: 'relative' }}>
                <button
                    onClick={toggleLang}
                    className='btn btn-sm btn-outline'
                    style={{ position: 'absolute', right: 0, top: 0, background: 'white', color: 'black' }}
                >
                    {language === 'en' ? '🇮🇳 HI' : '🇺🇸 EN'}
                </button>
                <h1>👤 {t('my_profile')}</h1>
                <p>{t('manage_account')}</p>
            </section>

            <div className='form'>
                {step === 1 && (
                    <div>
                        <VoiceAssistant onSpeechResult={handleVoiceInput} />

                        {/* Identity Verification Section */}
                        <div className="card" style={{ marginBottom: '20px', padding: '15px' }}>
                            <h3>🆔 {t('verify_identity')}</h3>
                            {user.isVerified ? (
                                <p className="text-success">✅ {t('verified')}</p>
                            ) : (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        placeholder={t('enter_aadhaar')}
                                        value={aadhaarInput}
                                        onChange={(e) => setAadhaarInput(e.target.value)}
                                        className="form-control"
                                    />
                                    <button onClick={handleVerifyParams} className="btn btn-primary" disabled={isVerifying}>
                                        {isVerifying ? t('loading') : t('verify')}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className='form-group'>
                            <label>{t('full_name')}</label>
                            <input
                                type='text'
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className='form-group'>
                            <label>{t('skills_required')}</label>
                            <input
                                type='text'
                                value={formData.skills}
                                onChange={(e) => setFormData({ ...formData, skills: e.target.value.toString().split(',') })}
                                placeholder={t('skills_placeholder')}
                            />
                        </div>
                        <button className='btn btn-block' onClick={() => setStep(2)}>{t('next_face_id')}</button>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <label>{t('register_face_id')}</label>
                        <FaceCapture onCapture={handleFaceCapture} />
                        {formData.faceData && <p style={{ color: 'green' }}>{t('face_registered')}</p>}

                        <button className='btn btn-block' onClick={onSubmit} disabled={!formData.faceData}>
                            {t('save_profile')}
                        </button>
                        <button className='btn' onClick={() => setStep(1)} style={{ background: '#ccc', marginTop: '10px' }}>{t('back')}</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WorkerProfile;
