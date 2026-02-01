import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import Skeleton from '../components/Skeleton';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Globe, Briefcase, MapPin, Users, Wallet, Calendar } from 'lucide-react';

function ThekedarDashboard() {
    const { t, language, changeLanguage } = useLanguage();
    const [stats, setStats] = useState({ activeContracts: 0, totalWorkers: 0, earnings: 0 });
    const [activeTab, setActiveTab] = useState('overview');
    const [jobs, setJobs] = useState([]);
    const [myWorkers, setMyWorkers] = useState([]);

    // Assisted Registration State
    const [showAddWorker, setShowAddWorker] = useState(false);
    const [newWorker, setNewWorker] = useState({ name: '', mobile: '', pin: '1234' });

    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
        fetchMarketJobs();
        fetchMyWorkers();
    }, []);

    const fetchMarketJobs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/jobs?jobType=contract&status=open');
            setJobs(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch jobs');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyWorkers = async () => {
        try {
            const res = await api.get('/thekedar/workers');
            setMyWorkers(res.data.data || []);
            setStats(prev => ({ ...prev, totalWorkers: res.data.data.length }));
        } catch (err) {
            console.error('Failed to fetch workers');
        }
    };

    const handleAssistedRegister = async (e) => {
        e.preventDefault();
        try {
            if (!user || !user._id) {
                toast.error("User session invalid. Please relogin.");
                return;
            }
            await api.post('/auth/register', { ...newWorker, role: 'worker', createdBy: user._id });
            toast.success('Worker Account Created & Added!');
            setNewWorker({ name: '', mobile: '', pin: '1234' });
            setShowAddWorker(false);
            fetchMyWorkers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create worker');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const toggleLang = () => changeLanguage(language === 'en' ? 'hi' : 'en');

    const handleBid = (job) => {
        const amount = prompt(`${t('place_bid')} (${t('wage_budget')}: ₹${job.wage}):`);
        if (amount) {
            api.post(`/bids/${job._id}`, { amount })
                .then(() => toast.success(t('success')))
                .catch(err => toast.error(t('error')));
        }
    };

    const tabs = [
        { id: 'overview', label: t('overview'), icon: <Briefcase size={18} /> },
        { id: 'market', label: t('find_contracts'), icon: <Globe size={18} /> },
        { id: 'team', label: t('my_team'), icon: <Users size={18} /> },
        { id: 'sites', label: t('my_sites') || 'My Sites', icon: <MapPin size={18} /> },
        { id: 'attendance', label: t('attendance'), icon: <Calendar size={18} /> },
        { id: 'wallet', label: t('wallet'), icon: <Wallet size={18} /> },
    ];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px' }}>
            {/* Premium Header */}
            <div className='premium-header'>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ color: 'white', marginBottom: '4px' }}>Hello, {user?.name || 'Thekedar'}</h2>
                        <span style={{ opacity: 0.8, fontSize: '0.9rem' }}>Manage your empire efficiently</span>
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

                {/* Navigation Pills */}
                <div className='nav' style={{ background: 'transparent', padding: '20px 0 0', border: 'none', justifyContent: 'flex-start' }}>
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            className={`nav-pill ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.15)', color: activeTab === tab.id ? 'var(--color-primary)' : 'white' }}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Area with Animation */}
            <div className='container'>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'overview' && (
                            <div className='grid-cards'>
                                <div className='glass-card text-center'>
                                    <h1 style={{ color: 'var(--color-primary)', fontSize: '3rem' }}>{stats.activeContracts}</h1>
                                    <p className='text-muted'>{t('active_contracts')}</p>
                                </div>
                                <div className='glass-card text-center'>
                                    <h1 style={{ color: 'var(--color-success)', fontSize: '3rem' }}>{stats.totalWorkers}</h1>
                                    <p className='text-muted'>{t('total_workers')}</p>
                                </div>
                                <div className='glass-card text-center'>
                                    <h1 style={{ color: 'var(--color-accent)', fontSize: '3rem' }}>₹{stats.earnings.toLocaleString()}</h1>
                                    <p className='text-muted'>{t('earnings')}</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'market' && (
                            <div className='job-feed'>
                                <h3>{t('available_contracts')}</h3>
                                {loading ? <Skeleton count={3} height="100px" /> : jobs.length === 0 ? (
                                    <div className='glass-card text-center text-muted'>No contracts available right now.</div>
                                ) : (
                                    <div className='grid-cards'>
                                        {jobs.map(job => (
                                            <div key={job._id} className='glass-card' style={{ borderLeft: '4px solid var(--color-primary)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                    <h4>{job.title}</h4>
                                                    <span className='badge badge-premium'>₹{job.wage}</span>
                                                </div>
                                                <p className='text-muted' style={{ fontSize: '0.9rem', marginBottom: '15px' }}>{job.description}</p>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#666' }}>📍 {job.location?.address}</span>
                                                    <button className='btn btn-primary' style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => handleBid(job)}>
                                                        Place Bid
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'team' && (
                            <div className='glass-card'>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3>{t('my_team')}</h3>
                                    <button className='btn btn-accent' onClick={() => setShowAddWorker(!showAddWorker)}>
                                        <Users size={18} /> Add New Worker
                                    </button>
                                </div>

                                {showAddWorker && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                        className='card' style={{ background: '#f0f9ff', padding: '20px', marginBottom: '20px', border: '1px solid #bae6fd' }}>
                                        <h4 style={{ marginBottom: '15px' }}>🆕 Create Worker Account</h4>
                                        <form onSubmit={handleAssistedRegister} style={{ display: 'grid', gap: '15px' }}>
                                            <input className="form-control" required placeholder="Full Name"
                                                value={newWorker.name} onChange={e => setNewWorker({ ...newWorker, name: e.target.value })} />
                                            <input className="form-control" required placeholder="Mobile Number"
                                                value={newWorker.mobile} onChange={e => setNewWorker({ ...newWorker, mobile: e.target.value })} />
                                            <input className="form-control" required placeholder="Set PIN (Default: 1234)"
                                                value={newWorker.pin} onChange={e => setNewWorker({ ...newWorker, pin: e.target.value })} />
                                            <button type="submit" className="btn btn-primary">Create Account</button>
                                        </form>
                                    </motion.div>
                                )}

                                <div className='worker-list'>
                                    {myWorkers.length === 0 && <p className="text-center text-muted">No workers yet.</p>}
                                    {myWorkers.map((worker) => (
                                        <div key={worker._id} style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center' }}>
                                            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', fontSize: '1.2rem' }}>
                                                {worker.faceData ? <img src={worker.faceData} alt="face" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : '👷'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600' }}>{worker.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{worker.mobile} • {worker.skills.join(', ')}</div>
                                            </div>
                                            <span className='badge badge-success' style={{ marginLeft: 'auto' }}>Active</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'sites' && <SitesTab t={t} user={user} />}
                        {activeTab === 'wallet' && (
                            <div className="glass-card text-center" style={{ padding: '60px' }}>
                                <Wallet size={50} color="var(--color-primary)" style={{ marginBottom: '20px' }} />
                                <h3>Manage Business Wallet</h3>
                                <p className="text-muted">View payments, credits, and withdrawals for your team.</p>
                                <button className="btn btn-primary" onClick={() => navigate('/wallet')}>Open Full Wallet</button>
                            </div>
                        )}
                        {activeTab === 'attendance' && (
                            <div className="glass-card" style={{ padding: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3>📑 Team Attendance Overview</h3>
                                    <button className="btn btn-outline btn-sm" onClick={() => fetchMyWorkers()}>Refresh</button>
                                </div>
                                <div className='worker-list'>
                                    {myWorkers.length === 0 && <p className="text-center text-muted">No workers found.</p>}
                                    {myWorkers.map((worker) => (
                                        <div key={worker._id} style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center' }}>
                                            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' }}>
                                                {worker.profileImage ? <img src={worker.profileImage} alt="face" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : '👷'}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '600' }}>{worker.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Status: <span style={{ color: '#22c55e' }}>Present Today</span></div>
                                            </div>
                                            <button className="btn btn-sm" style={{ background: '#e0f2fe', color: '#0369a1' }}>View History</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

function SitesTab({ t, user }) {
    const [sites, setSites] = useState([]);
    const [newSite, setNewSite] = useState({ name: '', address: '' });
    const [showForm, setShowForm] = useState(false);

    useEffect(() => { fetchSites(); }, []);

    const fetchSites = async () => {
        try {
            const res = await api.get('/sites');
            setSites(res.data.data);
        } catch (err) { console.error(err); }
    };

    const handleCreateSite = async (e) => {
        e.preventDefault();
        try {
            await api.post('/sites', newSite);
            toast.success('Site Created');
            setNewSite({ name: '', address: '' });
            setShowForm(false);
            fetchSites();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    // Helper to assign (Modal logic)
    const [assignModal, setAssignModal] = useState({ show: false, siteId: null });
    const [selectedWorker, setSelectedWorker] = useState('');
    const [workers, setWorkers] = useState([]);

    const openAssignModal = async (siteId) => {
        setAssignModal({ show: true, siteId });
        setSelectedWorker('');
        // Fetch workers fresh
        const res = await api.get('/thekedar/workers');
        setWorkers(res.data.data);
    };

    const handleAssignWorker = async () => {
        if (!selectedWorker) return;
        try {
            await api.post(`/sites/${assignModal.siteId}/assign`, { workerId: selectedWorker });
            toast.success('Worker Assigned');
            setAssignModal({ show: false, siteId: null });
            fetchSites();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>🏗️ My Construction Sites</h3>
                <button className='btn btn-primary' onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '➕ New Site'}
                </button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className='glass-card' style={{ marginBottom: '20px', border: '1px solid var(--color-primary-light)' }}>
                        <h4 style={{ marginBottom: '15px' }}>Add New Site</h4>
                        <form onSubmit={handleCreateSite} style={{ display: 'grid', gap: '15px' }}>
                            <input className='form-control' required
                                value={newSite.name} onChange={e => setNewSite({ ...newSite, name: e.target.value })}
                                placeholder="Site Name (e.g. Sector 45 Mall)" />
                            <input className='form-control' required
                                value={newSite.address} onChange={e => setNewSite({ ...newSite, address: e.target.value })}
                                placeholder="Site Address" />
                            <button className='btn btn-success'>Save Site</button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className='grid-cards'>
                {sites.map(site => (
                    <div key={site._id} className='glass-card' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <h4 style={{ margin: 0 }}>{site.name}</h4>
                                <span className='badge badge-info'>{site.workers.length} Staff</span>
                            </div>
                            <p className='text-muted' style={{ fontSize: '0.9rem' }}>📍 {site.address}</p>

                            <div style={{ margin: '15px 0' }}>
                                <strong style={{ fontSize: '0.85rem', color: '#64748b' }}>Team On-Site:</strong>
                                {site.workers.length === 0 ? <div style={{ color: '#999', fontSize: '0.85rem' }}>No workers assigned</div> : (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                                        {site.workers.map(w => (
                                            <span key={w._id} className='badge' style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                                                {w.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button className='btn btn-outline' style={{ width: '100%', marginTop: '10px' }} onClick={() => openAssignModal(site._id)}>
                            ➕ Assign Worker
                        </button>
                    </div>
                ))}
            </div>
            {sites.length === 0 && !showForm && <p className='text-center text-muted'>No sites added yet.</p>}

            {/* Assign Worker Modal */}
            <AnimatePresence>
                {assignModal.show && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                        }}>
                        <motion.div
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            className='glass-card' style={{ width: '350px', background: 'white' }}>
                            <h4 style={{ marginBottom: '15px' }}>Assign Worker to Site</h4>
                            <select className='form-control' value={selectedWorker} onChange={e => setSelectedWorker(e.target.value)}>
                                <option value="">Select a Worker...</option>
                                {workers.map(w => (
                                    <option key={w._id} value={w._id}>{w.name}</option>
                                ))}
                            </select>
                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button className='btn btn-outline' style={{ border: 'none' }} onClick={() => setAssignModal({ show: false, siteId: null })}>Cancel</button>
                                <button className='btn btn-success' onClick={handleAssignWorker}>Confirm Assignment</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ThekedarDashboard;
