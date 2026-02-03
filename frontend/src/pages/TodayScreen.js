import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Camera, MapPin, DollarSign, Award, ChevronRight, Bell, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Skeleton from '../components/Skeleton';
import { greetUser, speak } from '../utils/VoiceAssistant';

import ActionSuccess from '../components/ActionSuccess';

function TodayScreen() {
    const { t, language, changeLanguage } = useLanguage();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showProof, setShowProof] = useState(false);
    const [proofMessage, setProofMessage] = useState('');

    useEffect(() => {
        fetchTodayData();
    }, []);

    const fetchTodayData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/engagement/today');
            setData(res.data.data);

            // Auto-Speak with robust logic
            setTimeout(() => {
                if (res.data.data.greeting) greetUser(res.data.data.greeting.split(',')[1].trim(), language);
            }, 800); // Slight delay for browser to be ready

        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleMainAction = () => {
        if (data.mainAction.type === 'ATTENDANCE') {
            // Simulate attendance action for visual proof demonstration
            // In real flow, this would be after the API call on the next screen
            navigate('/worker/attendance');
        }
        else if (data.mainAction.type === 'FIND_JOBS') {
            navigate('/worker');
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '20px' }}><Skeleton height="200px" /></div>;

    if (error) return (
        <div style={{ padding: '20px', textAlign: 'center', marginTop: '50px' }}>
            <h3 style={{ color: '#ef4444' }}>⚠️ {t('unable_to_load')}</h3>
            <p style={{ color: '#64748b' }}>{error}</p>
            <button className='btn btn-primary' onClick={fetchTodayData}>{t('try_again')}</button>
        </div>
    );

    if (!data) return null;

    const isWorker = data.role === 'worker';

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '80px', background: '#f8fafc', minHeight: '100vh' }}>
            {/* Header / Top Bar */}
            <div style={{ padding: '20px', background: 'white', borderRadius: '0 0 25px 25px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h2 style={{ margin: 0, color: '#1e293b' }}>{data.greeting} 👋</h2>
                            <button className='btn btn-sm btn-light' onClick={() => greetUser(data.greeting.split(',')[1].trim(), language)} style={{ borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                                🔊
                            </button>
                            <button onClick={() => changeLanguage(language === 'en' ? 'hi' : 'en')} style={{ background: '#e2e8f0', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                {language === 'en' ? '🇮🇳 HI' : '🇺🇸 EN'}
                            </button>
                        </div>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Bell size={24} color="#64748b" />
                        <span style={{ position: 'absolute', top: -2, right: -2, width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%' }}></span>
                    </div>
                </div>

                {/* Daily Tip (Micro-Education) */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: '#eff6ff', padding: '12px 15px', borderRadius: '15px', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
                    <span style={{ fontSize: '1.2rem' }}>💡</span>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e40af', fontWeight: '500' }}>{data.tips}</p>
                </motion.div>

                {/* Smart Notification (Conditional) */}
                {data.stats.streak >= 3 && (
                    <motion.div
                        initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                        style={{ background: '#f0fdf4', padding: '10px', borderRadius: '12px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🏆</span>
                        <div>
                            <p style={{ margin: 0, fontWeight: 'bold', color: '#166534', fontSize: '0.9rem' }}>{t('youre_on_fire')}</p>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#15803d' }}>{t('keep_it_up')}</p>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="container" style={{ marginTop: '20px' }}>

                {/* 1. Main Action Card (One-Tap) */}
                <motion.div
                    whileTap={{ scale: 0.98 }}
                    onClick={handleMainAction}
                    style={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        padding: '25px',
                        borderRadius: '20px',
                        color: 'white',
                        boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        marginBottom: '25px'
                    }}
                >
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.5rem', marginBottom: '5px' }}>{data.mainAction.label}</h3>
                        <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>{t('tap_to_start')}</p>
                    </div>
                    <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {data.mainAction.icon === 'camera' ? <Camera size={28} /> : <ChevronRight size={28} />}
                    </div>
                </motion.div>

                {/* 2. Stats & Streak (Gamification) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                    <div className="glass-card" style={{ padding: '15px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                            <DollarSign size={16} color="#059669" />
                            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{t('earnings_today')}</span>
                        </div>
                        <h2 style={{ margin: 0, color: '#059669' }}>₹{data.stats.earningsToday || 0}</h2>
                    </div>

                    <div className="glass-card" style={{ padding: '15px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                            <Award size={16} color="#d97706" />
                            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{t('strength_streak')}</span>
                        </div>
                        <h2 style={{ margin: 0, color: '#d97706' }}>{data.stats.streak || 0} {t('days')} 🔥</h2>
                        {/* Streak Progress Bar */}
                        <div style={{ marginTop: '8px', background: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min((data.stats.streak || 0) * 10, 100)}%`, height: '100%', background: '#d97706' }}></div>
                        </div>
                    </div>
                </div>

                {/* 3. Badges Row */}
                <div style={{ marginBottom: '25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0 }}>{t('my_badges')}</h4>
                        <span style={{ fontSize: '0.8rem', color: '#2563eb' }}>{t('view_all')}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                        {(data.badges && data.badges.length > 0) ? data.badges.map((badge, i) => (
                            <div key={i} style={{ background: '#fff', padding: '10px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' }}>
                                <ShieldCheck size={20} color="#ca8a04" />
                                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{badge.type || 'Trusted'}</span>
                            </div>
                        )) : (
                            <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic' }}>{t('no_badges_yet')}</div>
                        )}
                    </div>
                </div>

                {/* 4. Support (Human Touch) */}
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <button className="btn btn-outline" style={{ fontSize: '0.9rem', color: '#64748b', border: '1px solid #cbd5e1' }}>
                        {t('need_help')}
                    </button>
                    <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        <ShieldCheck size={14} /> {t('data_secure')}
                    </div>
                </div>

            </div>

            <ActionSuccess isOpen={showProof} message={proofMessage} onClose={() => setShowProof(false)} />
        </div>
    );
}

export default TodayScreen;
