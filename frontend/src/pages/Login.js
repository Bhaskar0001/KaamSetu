import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { LogIn, Phone, Lock, Globe, ArrowRight } from 'lucide-react';

function Login() {
    const { t, language, changeLanguage } = useLanguage();
    const [formData, setFormData] = useState({ mobile: '', pin: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
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

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            toast.success(`${t('welcome')}, ${res.data.user.name}!`);

            const role = res.data.user.role;
            if (role === 'admin') navigate('/admin');
            else if (role === 'owner') navigate('/owner');
            else if (role === 'thekedar') navigate('/thekedar');
            else navigate('/worker');
        } catch (err) {
            const msg = err.response?.data?.message || t('error');
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleLang = () => changeLanguage(language === 'en' ? 'hi' : 'en');

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className='glass-card'
                style={{ width: '100%', maxWidth: '420px', padding: '40px', background: 'rgba(255,255,255,0.85)' }}
            >
                <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                    <button onClick={toggleLang} className='btn btn-sm btn-outline' style={{ borderRadius: '20px', padding: '6px 12px' }}>
                        <Globe size={14} style={{ marginRight: '5px' }} /> {language === 'en' ? 'HI' : 'EN'}
                    </button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                        width: '60px', height: '60px', background: 'var(--color-primary)',
                        borderRadius: '16px', margin: '0 auto 15px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px -5px rgba(37,99,235,0.4)'
                    }}>
                        <LogIn color='white' size={30} />
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '5px' }}>{t('login')}</h1>
                    <p className='text-muted'>Welcome back to Majdoor</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='error-box'
                        style={{ textAlign: 'center', fontSize: '0.9rem' }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={onSubmit}>
                    <div className='form-group' style={{ marginBottom: '20px' }}>
                        <label className='text-muted' style={{ fontSize: '0.85rem' }}>Mobile Number</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={18} style={{ position: 'absolute', left: '15px', top: '14px', color: '#94a3b8' }} />
                            <input
                                type='text'
                                className='form-control'
                                name='mobile'
                                value={formData.mobile}
                                placeholder='9876543210'
                                onChange={onChange}
                                required
                                style={{ paddingLeft: '45px' }}
                            />
                        </div>
                    </div>
                    <div className='form-group' style={{ marginBottom: '30px' }}>
                        <label className='text-muted' style={{ fontSize: '0.85rem' }}>PIN Code</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '15px', top: '14px', color: '#94a3b8' }} />
                            <input
                                type='password'
                                className='form-control'
                                name='pin'
                                value={formData.pin}
                                placeholder='••••'
                                onChange={onChange}
                                maxLength={4}
                                required
                                style={{ paddingLeft: '45px', letterSpacing: '4px' }}
                            />
                        </div>
                    </div>
                    <button type='submit' className='btn btn-primary btn-block' disabled={isLoading} style={{ width: '100%', justifyContent: 'center', height: '50px' }}>
                        {isLoading ? 'Verifying...' : <span style={{ display: 'flex', alignItems: 'center' }}>Login <ArrowRight size={18} style={{ marginLeft: '8px' }} /></span>}
                    </button>
                </form>

                <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem' }}>
                    <span className='text-muted'>{t('new_user')} </span>
                    <a href='/register' style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>{t('register_here')}</a>
                </div>

                <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginBottom: '10px' }}>DEMO CREDENTIALS</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span className='badge' style={{ background: '#e0f2fe', color: '#0369a1', cursor: 'pointer' }}
                            onClick={() => setFormData({ mobile: 'DEMO_WORKER', pin: '1234' })}>Worker</span>
                        <span className='badge' style={{ background: '#dcfce7', color: '#15803d', cursor: 'pointer' }}
                            onClick={() => setFormData({ mobile: 'DEMO_OWNER', pin: '1234' })}>Owner</span>
                        <span className='badge' style={{ background: '#fef9c3', color: '#a16207', cursor: 'pointer' }}
                            onClick={() => setFormData({ mobile: 'DEMO_THEKEDAR', pin: '1234' })}>Thekedar</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default Login;
