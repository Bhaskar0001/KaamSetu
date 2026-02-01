import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Save } from 'lucide-react';

function WorkerProfile() {
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);

    // Form State
    const [skills, setSkills] = useState('');
    const [experience, setExperience] = useState('');

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(u);
        if (u.skills) setSkills(u.skills.join(', '));
        if (u.experience) setExperience(u.experience);
        // In real app, we would load existing image from DB
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Mock Image Upload (In real app, upload to S3/Cloudinary and get URL)
            const mockImageUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;

            const updatedData = {
                skills: skills.split(',').map(s => s.trim()).filter(s => s),
                experience: Number(experience),
                profileImage: mockImageUrl // Saving the mock URL
            };

            const res = await api.put('/auth/profile', updatedData);

            // Update Local Storage
            const newUser = { ...user, ...updatedData };
            localStorage.setItem('user', JSON.stringify(newUser));

            toast.success('✅ Profile Updated Successfully!');
            setTimeout(() => navigate('/worker'), 1000); // Redirect to dashboard
        } catch (err) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'white', border: 'none', padding: '10px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                    <ArrowLeft size={24} color='#334155' />
                </button>
                <h2 style={{ margin: 0, color: '#1e293b' }}>Complete Profile</h2>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='glass-card'>
                <form onSubmit={handleSave}>
                    {/* Photo Upload Section */}
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 15px' }}>
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'user'}`}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid white', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <div style={{
                                position: 'absolute', bottom: '0', right: '0',
                                background: '#3b82f6', width: '40px', height: '40px',
                                borderRadius: '50%', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', border: '3px solid white'
                            }}>
                                <Camera size={20} color='white' />
                            </div>
                        </div>
                        <p className='text-muted'>Tap to change photo</p>
                    </div>

                    <div className='form-group'>
                        <label>Your Skills (कौशल)</label>
                        <input
                            type='text'
                            className='form-control'
                            value={skills}
                            onChange={e => setSkills(e.target.value)}
                            placeholder='Painter, Carpenter, Driver...'
                            style={{ height: '50px', fontSize: '1.1rem' }}
                            required
                        />
                        <small className='text-muted'>Comma separated values</small>
                    </div>

                    <div className='form-group'>
                        <label>Experience (Years) (अनुभव)</label>
                        <input
                            type='number'
                            className='form-control'
                            value={experience}
                            onChange={e => setExperience(e.target.value)}
                            placeholder='e.g. 5'
                            style={{ height: '50px', fontSize: '1.1rem' }}
                            required
                        />
                    </div>

                    <button
                        type='submit'
                        className='btn btn-success btn-block'
                        disabled={loading}
                        style={{ marginTop: '20px', padding: '15px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    >
                        {loading ? 'Saving...' : <><Save size={24} /> Save Profile</>}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

export default WorkerProfile;
