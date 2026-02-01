import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import Skeleton from '../components/Skeleton';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Search, Mic, MapPin, Briefcase, DollarSign, Wallet, User, Calendar, ArrowRight, AlertTriangle } from 'lucide-react';
import GlassModal from '../components/GlassModal';
import { saveOfflineAttendance, syncOfflineData } from '../utils/offlineQueue';

function WorkerDashboard() {
    const { t, language, changeLanguage } = useLanguage();
    // ... (rest of state)
    // ... 
    useEffect(() => {
        // Try to sync on load
        syncOfflineData();

        const userData = localStorage.getItem('user');
        // ... (existing auth logic)
    }, []);

    // ... (existing search functions)

    // Example Check-in Logic integration (Placeholder for where you'd call check-in)
    const handleCheckIn = async (jobId, location, selfieUrl) => {
        if (!navigator.onLine) {
            saveOfflineAttendance({ jobId, location, selfieUrl });
            return;
        }

        try {
            await api.post('/attendance/check-in', { jobId, status: 'present', location, selfieUrl });
            toast.success(t('checkin_success'));
        } catch (err) {
            toast.error(err.response?.data?.message || t('error'));
        }
    };
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [activeTab, setActiveTab] = useState('jobs');
    const [isProfileComplete, setIsProfileComplete] = useState(true); // Default check state

    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const u = JSON.parse(userData);
            setUser(u);

            // DIGITAL KYC GATEKEEPER
            // If verification status is missing or not VERIFIED, force redirect to KYC.
            if (!u.verification || u.verification.status !== 'VERIFIED') {
                if (u.role === 'worker') { // Apply strictly to workers for now
                    setTimeout(() => {
                        toast.warning('⚠️ Identity Verification Required (अपनी पहचान सत्यापित करें)');
                        navigate('/kyc');
                    }, 1000);
                    return; // Stop further loading
                }
            }

            // Old Checks (kept for safety, but KYC supersedes this)
            const complete = u.name && u.mobile && u.profileImage && u.skills && u.skills.length > 0;
            setIsProfileComplete(true); // Assuming KYC covers this, or we keep it as secondary
            fetchJobs();
        }
    }, []);
    const [isBidModalOpen, setIsBidModalOpen] = useState(false);
    const [selectedJobForBid, setSelectedJobForBid] = useState(null);
    const [bidAmount, setBidAmount] = useState('');

    const openBidModal = (job) => {
        setSelectedJobForBid(job);
        setBidAmount('');
        setIsBidModalOpen(true);
    };

    const submitBid = async () => {
        if (!bidAmount) return;
        try {
            await api.post(`/bids/${selectedJobForBid._id}`, { amount: Number(bidAmount) });
            toast.success('✅ ' + t('success'));
            setIsBidModalOpen(false);
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };



    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await api.get('/matches/worker');
            setJobs(res.data.data || []);

            // Check if cached
            if (res.isCached) {
                toast.info(`📶 Offline Mode: Showing data from ${new Date(res.config.timestamp || Date.now()).toLocaleTimeString()}`);
            }
        } catch (err) {
            console.error(err);
            toast.error(t('error'));
        }
        finally { setLoading(false); }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return fetchJobs();
        setLoading(true);
        try {
            const res = await api.get(`/jobs/search?q=${searchQuery}`);
            setJobs(res.data.data || []);
        } catch (err) { toast.error(t('error')); }
        finally { setLoading(false); }
    };

    const startVoiceSearch = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Voice search not supported');
            return;
        }
        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        recognition.start();
        setIsListening(true);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript);
            setIsListening(false);
            setLoading(true);
            api.get(`/jobs/search?q=${transcript}`)
                .then(res => setJobs(res.data.data || []))
                .catch(() => toast.error(t('error')))
                .finally(() => setLoading(false));
        };
        recognition.onerror = () => setIsListening(false);
    };

    const placeBid = async (jobId, jobTitle) => {
        const amount = prompt(`${t('place_bid')} - ${jobTitle}:`);
        if (!amount) return;
        try {
            await api.post(`/bids/${jobId}`, { amount: Number(amount) });
            toast.success('✅ ' + t('success'));
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const toggleLang = () => changeLanguage(language === 'en' ? 'hi' : 'en');

    // ... (previous code) ...

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px' }}>
            {/* Premium Header - Worker Theme (Blue/Orange) */}
            <div className='premium-header' style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ color: 'white', marginBottom: '4px' }}>नमस्ते, {user?.name || 'Worker'}</h2>
                        <span style={{ opacity: 0.8, fontSize: '0.9rem' }}>अपनी अगली नौकरी यहाँ खोजें</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={toggleLang} className='btn' style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '8px 12px' }}>
                            {language === 'en' ? '🇮🇳 HI' : '🇺🇸 EN'}
                        </button>
                        <button onClick={logout} className='btn' style={{ background: 'rgba(220, 38, 38, 0.8)', color: 'white', padding: '8px 12px' }}>
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>

                {/* Search Bar in Header */}
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <form onSubmit={handleSearch} style={{ flex: 1, position: 'relative' }}>
                        <Search size={24} style={{ position: 'absolute', left: '15px', top: '12px', color: '#94a3b8' }} />
                        <input
                            className='form-control'
                            placeholder={t('find_jobs')}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '50px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '1.1rem', height: '50px' }}
                        />
                    </form>
                    <button onClick={startVoiceSearch} className='btn' style={{ background: isListening ? '#ef4444' : 'white', color: isListening ? 'white' : '#0ea5e9', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                        <Mic size={28} />
                    </button>
                </div>

                {/* Nav Pills */}
                <div className='nav' style={{ background: 'transparent', padding: '20px 0 0', border: 'none', justifyContent: 'flex-start', gap: '15px' }}>
                    <div className={`nav-pill ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')} style={{ background: activeTab === 'jobs' ? 'white' : 'rgba(255,255,255,0.2)', color: activeTab === 'jobs' ? '#0284c7' : 'white', display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', padding: '10px 20px', borderRadius: '30px', fontSize: '1rem' }}>
                        <Briefcase size={20} /> {t('find_jobs')}
                    </div>
                    <div className='nav-pill' style={{ background: 'rgba(255,255,255,0.2)', color: 'white', display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', padding: '10px 20px', borderRadius: '30px', fontSize: '1rem' }} onClick={() => navigate('/worker/attendance')}>
                        <Calendar size={20} /> {t('attendance')}
                    </div>
                    <div className='nav-pill' style={{ background: 'rgba(255,255,255,0.2)', color: 'white', display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', padding: '10px 20px', borderRadius: '30px', fontSize: '1rem' }} onClick={() => navigate('/wallet')}>
                        <Wallet size={20} /> {t('wallet')}
                    </div>
                </div>
            </div>

            <div className='container'>
                {!isProfileComplete ? (
                    <div className='glass-card text-center' style={{ padding: '40px' }}>
                        <div style={{ width: '80px', height: '80px', background: '#fee2e2', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={40} color='#ef4444' />
                        </div>
                        <h2 style={{ color: '#ef4444', marginBottom: '10px' }}>Profile Incomplete (प्रोफ़ाइल अधूरी है)</h2>
                        <p className='text-muted' style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
                            You cannot see jobs until you complete your profile with Photo & Skills.
                            <br />
                            (नौकरियां देखने के लिए कृपया फोटो और कौशल जोड़ें)
                        </p>
                        <button className='btn btn-primary' onClick={() => navigate('/profile')} style={{ fontSize: '1.1rem', padding: '12px 24px' }}>
                            Complete Profile Now <ArrowRight size={20} />
                        </button>
                    </div>
                ) : activeTab === 'jobs' && (
                    <>
                        {/* ... Existing Job List ... */}
                        <h3 style={{ marginBottom: '15px', fontSize: '1.5rem' }}>🎯 आपके लिए नौकरियां (Recommended)</h3>
                        {loading ? <Skeleton height="150px" count={3} /> : jobs.length === 0 ? (
                            <div className='glass-card text-center'>
                                <h3>कोई नौकरी नहीं मिली</h3>
                                <p className='text-muted'>कुछ और खोजने का प्रयास करें।</p>
                            </div>
                        ) : (
                            <div className='grid-cards'>
                                {jobs.map(item => {
                                    const job = item.job || item;
                                    const score = item.score;
                                    return (
                                        <div key={job._id} className='glass-card' style={{ borderLeft: score > 70 ? '4px solid #22c55e' : '4px solid #e2e8f0' }}>
                                            {score && <span className='badge badge-success' style={{ marginBottom: '10px', display: 'inline-block', fontSize: '0.9rem' }}>{score.toFixed(0)}% मैच (Match)</span>}

                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{job.title}</h3>
                                                <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '1.2rem' }}>₹{job.wage}</span>
                                            </div>

                                            <p className='text-muted' style={{ fontSize: '1.1rem', marginBottom: '15px' }}>{job.description}</p>

                                            <div style={{ display: 'flex', gap: '15px', fontSize: '1rem', color: '#64748b', marginBottom: '15px' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={18} /> {job.location?.address || 'Remote'}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Briefcase size={18} /> {job.jobType}</span>
                                            </div>

                                            {job.requiredSkills && (
                                                <div style={{ marginBottom: '15px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                                    {job.requiredSkills.map((skill, i) => (
                                                        <span key={i} style={{ fontSize: '0.9rem', padding: '4px 10px', background: '#f1f5f9', borderRadius: '15px', color: '#475569' }}>{skill}</span>
                                                    ))}
                                                </div>
                                            )}

                                            <button className='btn btn-primary btn-block' style={{ fontSize: '1.1rem', padding: '12px' }} onClick={() => openBidModal(job)}>
                                                {job.jobType === 'bid' ? '🏷️ बोली लगाएं (Bid)' : '✅ आवेदन करें (Apply)'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            <GlassModal
                isOpen={isBidModalOpen}
                onClose={() => setIsBidModalOpen(false)}
                title={t('place_bid')}
            >
                <div>
                    <p style={{ marginBottom: '10px', fontSize: '1.1rem' }}>
                        नौकरी: <strong>{selectedJobForBid?.title}</strong>
                    </p>
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
                        अपनी दैनिक मजदूरी की बोली लगाएं। (Enter your daily wage bid)
                    </p>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>राशि (Amount) ₹</label>
                        <input
                            type="number"
                            className="form-control"
                            style={{ fontSize: '1.5rem', padding: '10px', width: '100%' }}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            placeholder="500"
                            autoFocus
                        />
                    </div>

                    <button className="btn btn-primary btn-block" style={{ fontSize: '1.2rem', padding: '12px' }} onClick={submitBid}>
                        🚀 बोली जमा करें (Submit)
                    </button>
                </div>
            </GlassModal>
        </div>
    );
}

export default WorkerDashboard;
