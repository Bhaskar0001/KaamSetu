import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../utils/api'; // Use our new helper
import { toast } from 'react-toastify';
import Skeleton from '../components/Skeleton';

import { useLanguage } from '../context/LanguageContext';

function OwnerDashboard() {
    const { t, language, changeLanguage } = useLanguage();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null); // For Modal
    const [bids, setBids] = useState([]);
    const [bidLoading, setBidLoading] = useState(false);

    // Negotiation State
    const [counterAmounts, setCounterAmounts] = useState({}); // Map bidId -> amount

    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
        fetchMyJobs();
    }, []);

    // ... (fetchMyJobs, etc. omitted for brevity, they remain same)

    const fetchMyJobs = async () => {
        try {
            const res = await api.get('/jobs/my-jobs');
            setJobs(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch jobs');
            toast.error('Could not load jobs');
        } finally {
            setLoading(false);
        }
    };

    const fetchBids = async (jobId) => {
        setBidLoading(true);
        try {
            const res = await api.get(`/bids/${jobId}`);
            setBids(res.data.data || []);
            // Initialize counter amounts
            const initialCounters = {};
            res.data.data.forEach(bid => initialCounters[bid._id] = bid.amount);
            setCounterAmounts(initialCounters);
        } catch (err) {
            toast.error('Could not load bids');
        } finally {
            setBidLoading(false);
        }
    };

    const openBidModal = (job) => {
        setSelectedJob(job);
        fetchBids(job._id);
    };

    const closeBidModal = () => {
        setSelectedJob(null);
        setBids([]);
    };

    const acceptBid = async (bidId) => {
        if (!window.confirm('Are you sure you want to accept this bid? This will generate a contract.')) return;
        try {
            await api.put(`/bids/${bidId}/accept`);
            toast.success('Bid Accepted & Contract Generated!');
            closeBidModal();
            fetchMyJobs(); // Refresh status
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to accept bid');
        }
    };

    const sendCounterOffer = async (bidId) => {
        const amount = counterAmounts[bidId];
        try {
            await api.put(`/bids/${bidId}/counter`, { amount });
            toast.success('Counter offer sent!');
            fetchBids(selectedJob._id); // Refresh bids
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send counter');
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

    if (loading) {
        return (
            <div className='container'>
                <Skeleton height="60px" style={{ marginBottom: '20px' }} />
                <div className='stats-grid'>
                    <Skeleton height="100px" />
                    <Skeleton height="100px" />
                    <Skeleton height="100px" />
                </div>
                <Skeleton height="150px" count={2} />
            </div>
        );
    }

    return (
        <div className='container'>
            {/* Role Banner */}
            <div className='role-banner' style={{ background: '#16a34a', display: 'flex', alignItems: 'center' }}>
                <span>🏢 {t('owner_panel')}</span>
                <span style={{ marginLeft: 'auto', marginRight: '10px' }}>{user?.name}</span>
                <button onClick={toggleLang} className='btn btn-sm btn-outline' style={{ background: 'white', color: 'black', marginRight: '10px' }}>
                    {language === 'en' ? '🇮🇳 HI' : '🇺🇸 EN'}
                </button>
                <button onClick={logout} className='btn btn-danger' style={{ padding: '5px 10px' }}>
                    {t('logout')}
                </button>
            </div>

            {/* Navigation */}
            <nav className='nav'>
                <a href='/owner' className='nav-link active'>📋 {t('my_jobs')}</a>
                <a href='/create-job' className='nav-link'>➕ {t('post_job')}</a>
                <a href='/wallet' className='nav-link'>💰 {t('wallet')}</a>
            </nav>

            {/* Header */}
            <section className='heading'>
                <h1>📋 My Posted Jobs</h1>
                <p>Manage your job listings and view bids</p>
            </section>

            {/* Stats */}
            <div className='stats-grid'>
                <div className='stat-card'>
                    <div className='stat-value'>{jobs.length}</div>
                    <div className='stat-label'>Total Jobs</div>
                </div>
                <div className='stat-card'>
                    <div className='stat-value'>{jobs.filter(j => j.status === 'open').length}</div>
                    <div className='stat-label'>Open</div>
                </div>
                <div className='stat-card'>
                    <div className='stat-value'>{jobs.filter(j => j.status === 'assigned').length}</div>
                    <div className='stat-label'>Assigned</div>
                </div>
            </div>

            {/* Action Button */}
            <button
                className='btn btn-primary btn-block mb-md'
                onClick={() => navigate('/create-job')}
            >
                ➕ Post New Job
            </button>

            {/* Job List */}
            {jobs.length === 0 ? (
                <div className='card text-center'>
                    <h3>No jobs posted yet</h3>
                    <p className='text-muted'>Create your first job posting to find workers</p>
                </div>
            ) : (
                jobs.map((job) => (
                    <div key={job._id} className='job-card'>
                        <div className='card-header'>
                            <h3 style={{ margin: 0 }}>{job.title}</h3>
                            <span className={`badge ${job.status === 'open' ? 'badge-success' : job.status === 'assigned' ? 'badge-primary' : 'badge-warning'}`}>
                                {job.status}
                            </span>
                        </div>
                        <p className='text-muted'>{job.description}</p>
                        <div className='job-meta'>
                            <span className='job-meta-item'>💰 ₹{job.wage}</span>
                            <span className='job-meta-item'>📋 {job.jobType}</span>
                            <span className='job-meta-item'>📍 {job.location?.address}</span>
                        </div>
                        <div className='flex gap-md'>
                            {job.jobType === 'bid' && job.status === 'open' && (
                                <button className='btn btn-outline' onClick={() => openBidModal(job)}>👀 View Bids</button>
                            )}
                            {/* In Phase 2: Show contract button if assigned */}
                            {job.status === 'assigned' && (
                                <button className='btn btn-success' onClick={() => {
                                    // Hack: We need contract ID. Ideally Job model should have 'contractId'. 
                                    // For now, we will assume backend fixes this or we fetch it.
                                    // Let's just try to navigate assuming the owner knows or we build a lookup. 
                                    // Actually, we should fetch contract ID via API.
                                    alert('To view contract, please check your email or "Contracts" tab (coming soon).');
                                }}>📝 View Contract</button>
                            )}
                        </div>
                    </div>
                ))
            )}

            {/* BID MODAL */}
            {selectedJob && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Bids for {selectedJob.title}</h3>
                            <button className="btn-close" onClick={closeBidModal}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {bidLoading ? <Skeleton height="50px" count={3} /> : bids.length === 0 ? (
                                <p>No bids received yet.</p>
                            ) : (
                                bids.map(bid => (
                                    <div key={bid._id} className={`bid-item ${bid.status}`}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div className="avatar-placeholder">{bid.worker.name.charAt(0)}</div>
                                            <div>
                                                <strong>{bid.worker.name}</strong>
                                                <div>Skills: {bid.worker.skills.join(', ')}</div>
                                            </div>
                                            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹{bid.amount}</div>
                                                <div className={`status-tag ${bid.status}`}>{bid.status}</div>
                                            </div>
                                        </div>

                                        {/* Negotiation UI */}
                                        {bid.status === 'pending' || bid.status === 'countered' || bid.status === 'counter_accepted' ? (
                                            <div className="negotiation-box" style={{ marginTop: '10px', background: '#f9f9f9', padding: '10px', borderRadius: '5px' }}>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <input
                                                        type="number"
                                                        value={counterAmounts[bid._id] || ''}
                                                        onChange={(e) => setCounterAmounts(prev => ({ ...prev, [bid._id]: e.target.value }))}
                                                        placeholder="Counter Amount"
                                                        style={{ width: '120px', padding: '5px' }}
                                                    />
                                                    <button className="btn btn-sm btn-outline" onClick={() => sendCounterOffer(bid._id)}>Counter Offer</button>
                                                    <button className="btn btn-sm btn-success" onClick={() => acceptBid(bid._id)}>✅ Accept</button>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; alignItems: center; z-index: 1000; }
                .modal-content { background: white; padding: 20px; borderRadius: 10px; width: 90%; max-width: 600px; max-height: 80vh; overflow-y: auto; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .btn-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
                .bid-item { border: 1px solid #eee; padding: 15px; margin-bottom: 10px; border-radius: 8px; }
                .bid-item.accepted { border-color: #16a34a; background: #f0fdf4; }
                .avatar-placeholder { width: 40px; height: 40px; background: #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
                .status-tag { font-size: 0.8rem; padding: 2px 6px; border-radius: 4px; display: inline-block; }
                .status-tag.pending { background: #fef08a; color: #854d0e; }
                .status-tag.accepted { background: #bbf7d0; color: #166534; }
                .status-tag.countered { background: #fed7aa; color: #9a3412; }
            `}</style>
        </div>
    );
}

export default OwnerDashboard;
