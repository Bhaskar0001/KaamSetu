import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { UserPlus, User, Phone, Briefcase, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

function Register() {
    const { t, language, changeLanguage } = useLanguage();
    const [formData, setFormData] = useState({
        name: '', mobile: '', pin: '', confirmPin: '', role: 'worker', aadhaarNumber: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Verification State
    const [otpSent, setOtpSent] = useState(false);
    const [enteredOtp, setEnteredOtp] = useState('');
    const [receivedOtp, setReceivedOtp] = useState(''); // For mock display
    const [isMobileVerified, setIsMobileVerified] = useState(false);
    const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);
    const [verifying, setVerifying] = useState({ mobile: false, aadhaar: false });

    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/');
        }
    }, [navigate]);

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    // --- Mock 2FA Handlers ---

    const handleSendOtp = async () => {
        if (!formData.mobile || formData.mobile.length !== 10) {
            return toast.error('Enter valid 10-digit mobile number');
        }
        setVerifying(p => ({ ...p, mobile: true }));
        try {
            const res = await api.post('/auth/send-otp', { mobile: formData.mobile });
            setOtpSent(true);
            setReceivedOtp(res.data.otp); // Mock: Store to show user
            toast.info(`OTP Sent: ${res.data.otp} (Valid for 5 mins)`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setVerifying(p => ({ ...p, mobile: false }));
        }
    };

    const handleVerifyOtp = async () => {
        if (!enteredOtp) return toast.error('Enter OTP');
        try {
            await api.post('/auth/verify-otp', { mobile: formData.mobile, otp: enteredOtp });
            setIsMobileVerified(true);
            setOtpSent(false); // Hide OTP field
            toast.success('white_check_mark Mobile Verified!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP');
        }
    };

    const handleVerifyAadhaar = async () => {
        if (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12) {
            return toast.error('Enter valid 12-digit Aadhaar');
        }
        setVerifying(p => ({ ...p, aadhaar: true }));
        try {
            await api.post('/auth/verify-aadhaar-details', { aadhaarNumber: formData.aadhaarNumber });
            setIsAadhaarVerified(true);
            toast.success('white_check_mark Aadhaar Verified!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification Failed');
        } finally {
            setVerifying(p => ({ ...p, aadhaar: false }));
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (formData.pin !== formData.confirmPin) {
            const msg = 'PINs do not match (पिन मेल नहीं खाते)';
            setError(msg);
            toast.error(msg);
            setIsLoading(false);
            return;
        }

        if (!isMobileVerified) {
            const msg = 'Please Verify Mobile Number First (मोबाइल सत्यापित करें)';
            setError(msg);
            toast.error(msg);
            setIsLoading(false);
            return;
        }

        if (!isAadhaarVerified) {
            const msg = 'Please Verify Aadhaar First (आधार सत्यापित करें)';
            setError(msg);
            toast.error(msg);
            setIsLoading(false);
            return;
        }

        if (formData.aadhaarNumber.length !== 12) {
            const msg = 'Aadhaar must be 12 digits (आधार 12 अंकों का होना चाहिए)';
            setError(msg);
            toast.error(msg);
            setIsLoading(false);
            return;
        }

        try {
            const { confirmPin, ...registerData } = formData;
            // Using API utility instead of hardcoded axios
            const res = await api.post('/auth/register', registerData);

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            toast.success('🎉 Registration successful! (पंजीकरण सफल!)');

            const role = res.data.user.role;
            if (role === 'admin') navigate('/admin');
            else if (role === 'owner') navigate('/owner');
            else if (role === 'owner') navigate('/owner');
            else if (role === 'owner') navigate('/owner');
            else if (role === 'thekedar') navigate('/thekedar');
            else navigate('/worker');

        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Registration failed. Try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', // Darker premium bg
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className='glass-card'
                style={{
                    width: '100%', maxWidth: '450px', padding: '40px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                    <button onClick={() => changeLanguage(language === 'en' ? 'hi' : 'en')} className='btn btn-sm' style={{ borderRadius: '20px', padding: '6px 12px', background: 'rgba(255,255,255,0.9)' }}>
                        <Globe size={14} style={{ marginRight: '5px' }} /> {language === 'en' ? 'हिन्दी' : 'EN'}
                    </button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                        width: '60px', height: '60px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        borderRadius: '16px', margin: '0 auto 15px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.4)'
                    }}>
                        <UserPlus color='white' size={30} />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '5px' }}>{t('create_account')}</h1>
                    <p className='text-muted' style={{ fontSize: '1.1rem' }}>{t('join_community')}</p>
                </div>

                {error && (
                    <div className='error-box' style={{
                        background: '#fee2e2', color: '#ef4444', padding: '12px',
                        borderRadius: '12px', marginBottom: '20px', textAlign: 'center',
                        fontSize: '0.95rem', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}>
                        <ShieldCheck size={18} /> {error}
                    </div>
                )}

                <form onSubmit={onSubmit}>
                    <div className='form-group'>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>{t('full_name')}</label>
                        <div style={{ position: 'relative' }}>
                            <User size={20} style={{ position: 'absolute', left: '15px', top: '14px', color: '#94a3b8' }} />
                            <input
                                type='text'
                                className='form-control'
                                name='name'
                                value={formData.name}
                                onChange={onChange}
                                required
                                placeholder='John Doe'
                                style={{ paddingLeft: '45px', fontSize: '1.1rem', height: '50px' }}
                            />
                        </div>
                    </div>

                    <div className='form-group'>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>{t('mobile')}</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Phone size={20} style={{ position: 'absolute', left: '15px', top: '14px', color: '#94a3b8' }} />
                                <input
                                    type='text'
                                    className='form-control'
                                    name='mobile'
                                    value={formData.mobile}
                                    onChange={onChange}
                                    disabled={isMobileVerified || otpSent}
                                    required
                                    placeholder='9876543210'
                                    maxLength={10}
                                    style={{ paddingLeft: '45px', fontSize: '1.1rem', height: '50px', background: isMobileVerified ? '#f0fdf4' : 'white' }}
                                />
                                {isMobileVerified && <ShieldCheck size={20} color='green' style={{ position: 'absolute', right: '15px', top: '14px' }} />}
                            </div>
                            {!isMobileVerified && !otpSent && (
                                <button type='button' className='btn' onClick={handleSendOtp} disabled={verifying.mobile} style={{ background: '#3b82f6', color: 'white', whiteSpace: 'nowrap' }}>
                                    {verifying.mobile ? t('sending') : t('get_otp')}
                                </button>
                            )}
                        </div>
                        {otpSent && !isMobileVerified && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                <input
                                    type='text'
                                    placeholder={t('enter_otp')}
                                    className='form-control'
                                    value={enteredOtp}
                                    onChange={(e) => setEnteredOtp(e.target.value)}
                                    maxLength={4}
                                    style={{ flex: 1, textAlign: 'center', letterSpacing: '2px' }}
                                />
                                <button type='button' className='btn btn-success' onClick={handleVerifyOtp}>{t('verify')}</button>
                            </motion.div>
                        )}
                        {receivedOtp && !isMobileVerified && <small className='text-muted' style={{ display: 'block', marginTop: '5px' }}>Test OTP: {receivedOtp}</small>}
                    </div>

                    <div className='form-group'>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>{t('aadhaar_number')}</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <ShieldCheck size={20} style={{ position: 'absolute', left: '15px', top: '14px', color: '#94a3b8' }} />
                                <input
                                    type='text'
                                    className='form-control'
                                    name='aadhaarNumber'
                                    value={formData.aadhaarNumber}
                                    onChange={onChange}
                                    disabled={isAadhaarVerified}
                                    required
                                    placeholder='1234 5678 9012'
                                    maxLength={12}
                                    style={{ paddingLeft: '45px', fontSize: '1.1rem', height: '50px', background: isAadhaarVerified ? '#f0fdf4' : 'white' }}
                                />
                                {isAadhaarVerified && <ShieldCheck size={20} color='green' style={{ position: 'absolute', right: '15px', top: '14px' }} />}
                            </div>
                            {!isAadhaarVerified && (
                                <button type='button' className='btn' onClick={handleVerifyAadhaar} disabled={verifying.aadhaar} style={{ background: '#8b5cf6', color: 'white', whiteSpace: 'nowrap' }}>
                                    {verifying.aadhaar ? t('verifying') : t('verify')}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className='form-group'>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>{t('i_am_a')}</label>
                        <div style={{ position: 'relative' }}>
                            <Briefcase size={20} style={{ position: 'absolute', left: '15px', top: '14px', color: '#94a3b8' }} />
                            <select
                                className='form-control'
                                name='role'
                                value={formData.role}
                                onChange={onChange}
                                style={{ paddingLeft: '45px', fontSize: '1.1rem', height: '50px', cursor: 'pointer' }}
                            >
                                <option value='worker'>{t('worker_option')}</option>
                                <option value='thekedar'>{t('thekedar_option')}</option>
                                <option value='owner'>{t('owner_option')}</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className='form-group'>
                            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>{t('pin')}</label>
                            <input
                                type='password'
                                className='form-control'
                                name='pin'
                                value={formData.pin}
                                onChange={onChange}
                                maxLength={4}
                                required
                                placeholder='1234'
                                style={{ textAlign: 'center', fontSize: '1.2rem', height: '50px', letterSpacing: '2px' }}
                            />
                        </div>
                        <div className='form-group'>
                            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>{t('confirm_pin')}</label>
                            <input
                                type='password'
                                className='form-control'
                                name='confirmPin'
                                value={formData.confirmPin}
                                onChange={onChange}
                                maxLength={4}
                                required
                                placeholder='1234'
                                style={{ textAlign: 'center', fontSize: '1.2rem', height: '50px', letterSpacing: '2px' }}
                            />
                        </div>
                    </div>

                    <button
                        type='submit'
                        className='btn btn-success btn-block'
                        disabled={isLoading}
                        style={{ marginTop: '20px', width: '100%', justifyContent: 'center', height: '55px', fontSize: '1.2rem' }}
                    >
                        {isLoading ? t('creating_account') : <span style={{ display: 'flex', alignItems: 'center' }}>{t('register_now')} <ArrowRight size={20} style={{ marginLeft: '8px' }} /></span>}
                    </button>
                </form>

                <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '1rem' }}>
                    <span className='text-muted'>{t('already_have_account')} </span>
                    <Link to='/login' style={{ color: 'var(--color-success)', fontWeight: '700', textDecoration: 'none' }}>{t('login_here')}</Link>
                </div>
            </motion.div>
        </div>
    );
}

export default Register;
