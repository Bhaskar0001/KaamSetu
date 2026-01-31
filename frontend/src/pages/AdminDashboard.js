import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Skeleton from '../components/Skeleton';

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [fraudLogs, setFraudLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')} ` } };

            const [statsRes, logsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/stats', config),
                axios.get('http://localhost:5000/api/admin/fraud-logs', config)
            ]);

            setStats(statsRes.data.data);
            setFraudLogs(logsRes.data.data || []);
        } catch (err) {
            console.error('Admin data fetch failed:', err);
            toast.error('Failed to load system data');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className='container'>
                <Skeleton height="60px" style={{ marginBottom: '20px' }} />
                <div className='stats-grid'>
                    <Skeleton height="100px" />
                    <Skeleton height="100px" />
                    <Skeleton height="100px" />
                    <Skeleton height="100px" />
                </div>
                <Skeleton height="200px" />
            </div>
        );
    }

    return (
        <div className='container'>
            {/* Role Banner */}
            <div className='role-banner' style={{ background: '#dc2626' }}>
                <span>🛠️ Admin Panel</span>
                <span style={{ marginLeft: 'auto' }}>{user?.name}</span>
                <button onClick={logout} className='btn' style={{ marginLeft: '10px', padding: '5px 10px', background: '#fff', color: '#dc2626' }}>
                    Logout
                </button>
            </div>

            {/* Navigation */}
            <nav className='nav'>
                <a href='/admin' className='nav-link active'>📊 Dashboard</a>
                <a href='/admin/users' className='nav-link'>👥 Users</a>
                <a href='/admin/fraud' className='nav-link'>🚨 Fraud Logs</a>
            </nav>

            {/* Header */}
            <section className='heading'>
                <h1>📊 System Dashboard</h1>
                <p>Monitor platform health and security</p>
            </section>

            {/* Stats Grid */}
            {stats && (
                <div className='stats-grid'>
                    <div className='stat-card'>
                        <div className='stat-value'>{stats.workers}</div>
                        <div className='stat-label'>👷 Workers</div>
                    </div>
                    <div className='stat-card'>
                        <div className='stat-value'>{stats.owners}</div>
                        <div className='stat-label'>🏢 Owners</div>
                    </div>
                    <div className='stat-card'>
                        <div className='stat-value'>{stats.jobs}</div>
                        <div className='stat-label'>📋 Total Jobs</div>
                    </div>
                    <div className='stat-card'>
                        <div className='stat-value' style={{ color: '#dc2626' }}>{fraudLogs.length}</div>
                        <div className='stat-label'>🚨 Fraud Alerts</div>
                    </div>
                </div>
            )}

            {/* Fraud Alerts Section */}
            <div className='card'>
                <h2>🚨 Recent Fraud Alerts</h2>
                {fraudLogs.length === 0 ? (
                    <div className='success-box'>
                        ✅ No fraud detected. System is healthy.
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#1e293b', color: 'white' }}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>User</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Risk Score</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Reason</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fraudLogs.map((log) => (
                                <tr key={log._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '12px' }}>
                                        {log.user?.name || 'Unknown'} <br />
                                        <small className='text-muted'>{log.user?.mobile}</small>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span className='badge badge-danger'>{log.riskScoreAdded}</span>
                                    </td>
                                    <td style={{ padding: '12px' }}>{log.reason || 'N/A'}</td>
                                    <td style={{ padding: '12px' }} className='text-muted'>
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Quick Actions */}
            <div className='card'>
                <h3>⚡ Quick Actions</h3>
                <div className='flex gap-md' style={{ flexWrap: 'wrap' }}>
                    <button className='btn btn-outline'>📥 Export Users</button>
                    <button className='btn btn-outline'>📊 Revenue Report</button>
                    <button className='btn btn-danger'>🚫 Freeze Flagged Users</button>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
