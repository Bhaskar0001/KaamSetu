import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import Skeleton from '../components/Skeleton';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, LayoutList, PlusCircle, CreditCard, Briefcase, MapPin, User } from 'lucide-react';

function OwnerDashboard() {
    const { t, language, changeLanguage } = useLanguage();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('jobs');

    // State for Bids Modal
    const [selectedJob, setSelectedJob] = useState(null);
    const [bids, setBids] = useState([]);
    const [bidLoading, setBidLoading] = useState(false);
    const [counterAmounts, setCounterAmounts] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
        fetchMyJobs();
    }, []);

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
            const initialCounters = {};
            res.data.data.forEach(bid => initialCounters[bid._id] = bid.amount);
            setCounterAmounts(initialCounters);
        } catch (err) { toast.error('Could not load bids'); }
        finally { setBidLoading(false); }
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
        if (!window.confirm('Accept this bid?')) return;
        try {
            await api.put(`/bids/${bidId}/accept`);
            toast.success('Bid Accepted');
            closeBidModal();
            fetchMyJobs();
        } catch (err) { toast.error('Failed to accept'); }
    };

    const sendCounterOffer = async (bidId) => {
        try {
            await api.put(`/bids/${bidId}/counter`, { amount: counterAmounts[bidId] });
            toast.success('Counter offer sent!');
            fetchBids(selectedJob._id);
        } catch (err) { toast.error('Failed to send counter'); }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const toggleLang = () => changeLanguage(language === 'en' ? 'hi' : 'en');

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px' }}>
            {/* Premium Header - Green Theme for Owner (Growth) */}
            <div className='premium-header' style={{ background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ color: 'white', marginBottom: '4px' }}>Hello, {user?.name || 'Owner'}</h2>
                        <span style={{ opacity: 0.8, fontSize: '0.9rem' }}>Manage your projects & hiring</span>
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

                {/* Nav Pills */}
                <div className='nav' style={{ background: 'transparent', padding: '20px 0 0', border: 'none', justifyContent: 'flex-start', gap: '15px' }}>
                    <div className={`nav-pill ${activeTab === 'jobs' ? 'active' : ''}`} style={{ background: activeTab === 'jobs' ? 'white' : 'rgba(255,255,255,0.15)', color: activeTab === 'jobs' ? '#15803d' : 'white', display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }} onClick={() => setActiveTab('jobs')}>
                        <LayoutList size={18} /> {t('my_jobs')}
                    </div>
                    <div className='nav-pill' style={{ background: 'rgba(255,255,255,0.15)', color: 'white', display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/create-job')}>
                        <PlusCircle size={18} /> {t('post_job')}
                    </div>
                    <div className='nav-pill' style={{ background: 'rgba(255,255,255,0.15)', color: 'white', display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/wallet')}>
                        <CreditCard size={18} /> {t('wallet')}
                    </div>
                    <div className={`nav-pill ${activeTab === 'attendance' ? 'active' : ''}`} style={{ background: activeTab === 'attendance' ? 'white' : 'rgba(255,255,255,0.15)', color: activeTab === 'attendance' ? '#15803d' : 'white', display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }} onClick={() => setActiveTab('attendance')}>
                        <LayoutList size={18} /> Attendance
                    </div>
                </div>
            </div>

            <div className='container'>
                {/* Stats */}
                {!loading && (
                    <div className='grid-cards' style={{ marginBottom: '30px' }}>
                        <div className='glass-card text-center'>
                            <h1 style={{ color: '#15803d', fontSize: '2.5rem' }}>{jobs.length}</h1>
                            <p className='text-muted'>Total Jobs</p>
                        </div>
                        <div className='glass-card text-center'>
                            <h1 style={{ color: 'var(--color-accent)', fontSize: '2.5rem' }}>{jobs.filter(j => j.status === 'open').length}</h1>
                            <p className='text-muted'>Open for Bidding</p>
                        </div>
                        <div className='glass-card text-center'>
                            <h1 style={{ color: 'var(--color-primary)', fontSize: '2.5rem' }}>{jobs.filter(j => j.status === 'assigned').length}</h1>
                            <p className='text-muted'>Active Contracts</p>
                        </div>
                    </div>
                )}

                {/* Content Sections */}
                {activeTab === 'jobs' ? (
                    <>
                        <h3 style={{ marginBottom: '15px' }}>📋 Recent Postings</h3>
                        {loading ? <Skeleton height="150px" count={2} /> : jobs.length === 0 ? (
                            <div className='glass-card text-center'>
                                <p className='text-muted'>You haven't posted any jobs yet.</p>
                                <button className='btn btn-success' onClick={() => navigate('/create-job')}>Post First Job</button>
                            </div>
                        ) : (
                            <div className='grid-cards'>
                                {jobs.map((job) => (
                                    <div key={job._id} className='glass-card'>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <h3>{job.title}</h3>
                                            <span className={`badge ${job.status === 'open' ? 'badge-success' : 'badge-premium'}`}>{job.status.toUpperCase()}</span>
                                        </div>
                                        <p className='text-muted' style={{ fontSize: '0.9rem', marginBottom: '15px' }}>{job.description}</p>

                                        <div style={{ display: 'grid', gap: '5px', marginBottom: '15px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#475569' }}>
                                                <Briefcase size={14} /> {job.jobType} • ₹{job.wage}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#475569' }}>
                                                <MapPin size={14} /> {job.location?.address}
                                            </span>
                                        </div>

                                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', display: 'flex', gap: '10px' }}>
                                            {job.status === 'open' && (
                                                <button className='btn btn-outline btn-sm' style={{ flex: 1 }} onClick={() => openBidModal(job)}>
                                                    👀 View Bids
                                                </button>
                                            )}
                                            {job.status === 'assigned' && (
                                                <button className='btn btn-primary btn-sm' style={{ flex: 1 }}>
                                                    View Contract
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="glass-card">
                        <h3 style={{ marginBottom: '20px' }}>📋 Site Attendance (Your Projects)</h3>
                        <div className="text-center text-muted" style={{ padding: '40px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📡</div>
                            <p>Connect with a Thekedar to see live worker attendance on your sites.</p>
                            <button className="btn btn-outline" onClick={() => setActiveTab('jobs')}>View Active Jobs</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bid Modal */}
            <AnimatePresence>
                {selectedJob && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="modal-overlay" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                        <motion.div
                            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                            className="glass-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto', background: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
                                <h3>Bids for {selectedJob.title}</h3>
                                <button style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }} onClick={closeBidModal}>×</button>
                            </div>

                            {bidLoading ? <Skeleton height="60px" count={3} /> : bids.length === 0 ? (
                                <p className='text-muted text-center'>No bids received yet.</p>
                            ) : (
                                bids.map(bid => (
                                    <div key={bid._id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', marginBottom: '10px', background: bid.status.includes('accept') ? '#f0fdf4' : 'white' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <User size={20} color='#64748b' />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>{bid.worker.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{bid.worker.skills.join(', ')}</div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>₹{bid.amount}</div>
                                                <span className={`badge ${bid.status === 'accepted' ? 'badge-success' : 'badge-warning'}`}>{bid.status}</span>
                                            </div>
                                        </div>

                                        {(bid.status === 'pending' || bid.status === 'countered') && (
                                            <div style={{ marginTop: '10px', background: '#f8fafc', padding: '10px', borderRadius: '6px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <input
                                                    type='number'
                                                    value={counterAmounts[bid._id] || ''}
                                                    onChange={e => setCounterAmounts(p => ({ ...p, [bid._id]: e.target.value }))}
                                                    placeholder='Counter (₹)'
                                                    className='form-control'
                                                    style={{ padding: '6px 10px', width: '120px' }}
                                                />
                                                <button className='btn btn-sm btn-outline' onClick={() => sendCounterOffer(bid._id)}>Counter</button>
                                                <button className='btn btn-sm btn-success' onClick={() => acceptBid(bid._id)}>Accept</button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: center; alignItems: center; z-index: 1000; }`}</style>
        </div>
    );
}

export default OwnerDashboard;
