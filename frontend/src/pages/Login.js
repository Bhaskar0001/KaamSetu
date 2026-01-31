import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useLanguage } from '../context/LanguageContext';

function Login() {
    const { t, language, changeLanguage } = useLanguage();
    const [formData, setFormData] = useState({ mobile: '', pin: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // If already logged in, redirect
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

            // Redirect based on role
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

    const toggleLang = () => {
        changeLanguage(language === 'en' ? 'hi' : 'en');
    };

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
                <h1>🔐 {t('login')}</h1>
                <p>{t('welcome')}</p>
            </section>

            {error && <div className='error-box'>{error}</div>}

            <div className='card'>
                <form onSubmit={onSubmit}>
                    <div className='form-group'>
                        <label>📱 {t('mobile')}</label>
                        <input
                            type='text'
                            className='form-control'
                            name='mobile'
                            value={formData.mobile}
                            placeholder={t('mobile')}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label>🔢 {t('pin')}</label>
                        <input
                            type='password'
                            className='form-control'
                            name='pin'
                            value={formData.pin}
                            placeholder={t('pin')}
                            onChange={onChange}
                            maxLength={4}
                            required
                        />
                    </div>
                    <button type='submit' className='btn btn-primary btn-block' disabled={isLoading}>
                        {isLoading ? <><span className='spinner'></span> {t('loading')}</> : `➡️ ${t('login')}`}
                    </button>
                </form>
            </div>

            <p className='text-center text-muted mt-md'>
                {t('new_user')} <a href='/register'>{t('register_here')}</a>
            </p>

            <div className='card' style={{ marginTop: '20px', background: '#f0f9ff' }}>
                <h3>🧪 {t('demo_creds')}</h3>
                <p><strong>{t('worker')}:</strong> DEMO_WORKER / 1234</p>
                <p><strong>{t('owner')}:</strong> DEMO_OWNER / 1234</p>
                <p><strong>{t('thekedar_panel')}:</strong> DEMO_THEKEDAR / 1234</p>
                <p><strong>{t('admin')}:</strong> DEMO_ADMIN / 1234</p>
            </div>
        </div>
    );
}

export default Login;
