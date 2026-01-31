import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import Skeleton from '../components/Skeleton';
import { useLanguage } from '../context/LanguageContext';

function ThekedarDashboard() {
    const { t, language, changeLanguage } = useLanguage();
    const [stats, setStats] = useState({ activeContracts: 0, totalWorkers: 0, earnings: 0 });
    const [activeTab, setActiveTab] = useState('overview'); // overview, market, team
    const [jobs, setJobs] = useState([]); // Market jobs
    const [myWorkers, setMyWorkers] = useState([]); // Team
    const [workerMobile, setWorkerMobile] = useState('');
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
            // Filter for contract jobs specifically
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

    const addWorker = async () => {
        if (!workerMobile) return;
        try {
            await api.post('/thekedar/add-worker', { mobile: workerMobile });
            toast.success(t('success'));
            setWorkerMobile('');
            fetchMyWorkers();
        } catch (err) {
            toast.error(err.response?.data?.message || t('error'));
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const toggleLang = () => {
        changeLanguage(language === 'en' ? 'hi' : 'en');
    };

    const handleBid = (job) => {
        const amount = prompt(`${t('place_bid')} (${t('wage_budget')}: ₹${job.wage}):`);
        if (amount) {
            api.post(`/bids/${job._id}`, { amount })
                .then(() => toast.success(t('success')))
                .catch(err => toast.error(t('error')));
        }
    };

    return (
        <div className='container'>
            {/* Header */}
            <div className='role-banner' style={{ background: '#f59e0b', color: '#000', display: 'flex', alignItems: 'center' }}>
                <span>👷‍♂️ {t('thekedar_panel')}</span>
                <span style={{ marginLeft: 'auto', marginRight: '10px' }}>{user?.name}</span>
                <button onClick={toggleLang} className='btn btn-sm btn-outline' style={{ background: 'white', color: 'black', marginRight: '10px' }}>
                    {language === 'en' ? '🇮🇳 HI' : '🇺🇸 EN'}
                </button>
                <button onClick={logout} className='btn btn-danger' style={{ padding: '5px 10px' }}>
                    {t('logout')}
                </button>
            </div>

            {/* Navigation Tabs */}
            <nav className='nav'>
                <button
                    className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 {t('overview')}
                </button>
                <button
                    className={`nav-link ${activeTab === 'market' ? 'active' : ''}`}
                    onClick={() => setActiveTab('market')}
                >
                    🏢 {t('find_contracts')}
                </button>
                <button
                    className={`nav-link ${activeTab === 'team' ? 'active' : ''}`}
                    onClick={() => setActiveTab('team')}
                >
                    👥 {t('my_team')}
                </button>
            </nav>

            {/* Content Area */}
            <div className='dashboard-content' style={{ marginTop: '20px' }}>

                {activeTab === 'overview' && (
                    <div className='stats-grid'>
                        <div className='stat-card'>
                            <div className='stat-value'>{stats.activeContracts}</div>
                            <div className='stat-label'>{t('active_contracts')}</div>
                        </div>
                        <div className='stat-card'>
                            <div className='stat-value'>{stats.totalWorkers}</div>
                            <div className='stat-label'>{t('total_workers')}</div>
                        </div>
                        <div className='stat-card'>
                            <div className='stat-value'>₹{stats.earnings.toLocaleString()}</div>
                            <div className='stat-label'>{t('earnings')}</div>
                        </div>
                    </div>
                )}

                {activeTab === 'market' && (
                    <div className='job-feed'>
                        <h3>{t('available_contracts')}</h3>
                        {loading ? <Skeleton count={3} height="100px" /> : jobs.length === 0 ? (
                            <p>{t('no_jobs')}</p>
                        ) : (
                            jobs.map(job => (
                                <div key={job._id} className='job-card'>
                                    <div className='card-header'>
                                        <h3>{job.title}</h3>
                                        <span className='badge badge-info'>{job.jobType}</span>
                                    </div>
                                    <p>{job.description}</p>
                                    <div className='job-meta'>
                                        <span>💰 ₹{job.wage}</span>
                                        <span>📍 {job.location?.address}</span>
                                    </div>
                                    <button className='btn btn-primary' onClick={() => handleBid(job)}>
                                        ⚡ {t('place_bid')}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'team' && (
                    <div className='card'>
                        <h3>{t('manage_workers')}</h3>
                        <p className='text-muted'>Manage your pool of workers here.</p>

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            <input
                                type="text"
                                placeholder={t('mobile')}
                                value={workerMobile}
                                onChange={(e) => setWorkerMobile(e.target.value)}
                                className="form-control"
                            />
                            <button className='btn btn-success' onClick={addWorker}>
                                ➕ {t('add_worker')}
                            </button>
                        </div>

                        <div className='worker-list'>
                            {myWorkers.length === 0 && <p className="text-muted">No workers in your team yet.</p>}
                            {myWorkers.map((worker, i) => (
                                <div key={worker._id} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}>
                                        {worker.faceData ? <img src={worker.faceData} alt="face" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : '👤'}
                                    </div>
                                    <div>
                                        <strong>{worker.name}</strong>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{worker.mobile} | {worker.skills.join(', ')}</div>
                                    </div>
                                    <span className='badge badge-success' style={{ marginLeft: 'auto' }}>Available</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ThekedarDashboard;
