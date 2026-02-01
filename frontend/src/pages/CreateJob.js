import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Calendar, ChevronLeft, Layout } from 'lucide-react';

function CreateJob() {
    const { t, language, changeLanguage } = useLanguage();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        jobType: 'direct',
        wage: '',
        address: '',
        requiredSkills: '',
        date: '',
    });
    const [loading, setLoading] = useState(false);

    const { title, description, jobType, wage, address, requiredSkills, date } = formData;
    const navigate = useNavigate();

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const jobData = {
                ...formData,
                requiredSkills: requiredSkills.split(',').map((s) => s.trim()),
                location: { address },
            };

            await api.post('/jobs', jobData);
            toast.success('🎉 ' + t('success'));
            navigate('/owner'); // Redirect to dashboard
        } catch (err) {
            toast.error(t('error'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleLang = () => changeLanguage(language === 'en' ? 'hi' : 'en');

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '80px' }}>
            {/* Header */}
            <div className='premium-header' style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '0 0 20px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button onClick={() => navigate(-1)} className='btn' style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '8px', borderRadius: '50%' }}>
                            <ChevronLeft size={20} />
                        </button>
                        <h2 style={{ color: 'white', margin: 0 }}>{t('post_job')}</h2>
                    </div>
                    <button onClick={toggleLang} className='btn' style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '6px 12px' }}>
                        {language === 'en' ? '🇮🇳 HI' : '🇺🇸 EN'}
                    </button>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: '5px', marginLeft: '45px' }}>{t('find_best_workers')}</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='container'
                style={{ marginTop: '-30px' }}
            >
                <div className='glass-card' style={{ padding: '30px' }}>
                    <form onSubmit={onSubmit}>
                        {/* Job Details Section */}
                        <div style={{ marginBottom: '25px' }}>
                            <h3 style={{ fontSize: '1.2rem', color: '#334155', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Briefcase size={20} color='var(--color-primary)' /> Job Details (कार्य विवरण)
                            </h3>

                            <div className='form-group'>
                                <label style={{ fontWeight: 600 }}>Job Title (काम का नाम)</label>
                                <input
                                    type='text'
                                    className='form-control'
                                    name='title'
                                    value={title}
                                    onChange={onChange}
                                    required
                                    placeholder='e.g. Painter Needed (पेंटर चाहिए)'
                                    style={{ fontSize: '1.1rem', padding: '12px' }}
                                />
                            </div>

                            <div className='form-group'>
                                <label style={{ fontWeight: 600 }}>Description (विवरण)</label>
                                <textarea
                                    className='form-control'
                                    name='description'
                                    value={description}
                                    onChange={onChange}
                                    required
                                    rows={3}
                                    placeholder='Describe the work...'
                                    style={{ fontSize: '1rem', padding: '12px' }}
                                />
                            </div>
                        </div>

                        {/* Payment & Type Section */}
                        <div style={{ marginBottom: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className='form-group'>
                                <label style={{ fontWeight: 600 }}>Job Type (भर्ती प्रकार)</label>
                                <div style={{ position: 'relative' }}>
                                    <Layout size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
                                    <select className='form-control' name='jobType' value={jobType} onChange={onChange} style={{ paddingLeft: '40px', cursor: 'pointer' }}>
                                        <option value='direct'>⚡ Direct Hire (सीधी भर्ती)</option>
                                        <option value='bid'>🏷️ Bidding (बोली)</option>
                                        <option value='contract'>📜 Contract (ठेका)</option>
                                    </select>
                                </div>
                            </div>
                            <div className='form-group'>
                                <label style={{ fontWeight: 600 }}>Wage/Budget (दीहाड़ी ₹)</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '15px', top: '12px', fontWeight: 'bold', color: '#94a3b8' }}>₹</span>
                                    <input
                                        type='number'
                                        className='form-control'
                                        name='wage'
                                        value={wage}
                                        onChange={onChange}
                                        required
                                        placeholder='500'
                                        style={{ paddingLeft: '35px' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location & Skills */}
                        <div style={{ marginBottom: '25px' }}>
                            <div className='form-group'>
                                <label style={{ fontWeight: 600 }}>Location (काम का पता)</label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
                                    <input
                                        type='text'
                                        className='form-control'
                                        name='address'
                                        value={address}
                                        onChange={onChange}
                                        required
                                        placeholder='Full Address (पूरा पता)'
                                        style={{ paddingLeft: '40px' }}
                                    />
                                </div>
                            </div>

                            <div className='form-group'>
                                <label style={{ fontWeight: 600 }}>Skills (आवश्यक कौशल)</label>
                                <input
                                    type='text'
                                    className='form-control'
                                    name='requiredSkills'
                                    value={requiredSkills}
                                    onChange={onChange}
                                    placeholder='e.g. Mason, Helper, Painter (कॉमा लगाकर लिखें)'
                                />
                            </div>

                            <div className='form-group'>
                                <label style={{ fontWeight: 600 }}>Date (तारीख)</label>
                                <div style={{ position: 'relative' }}>
                                    <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
                                    <input
                                        type='date'
                                        className='form-control'
                                        name='date'
                                        value={date}
                                        onChange={onChange}
                                        required
                                        style={{ paddingLeft: '40px' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type='submit'
                            className='btn btn-success btn-block'
                            disabled={loading}
                            style={{ fontSize: '1.2rem', padding: '15px' }}
                        >
                            {loading ? 'Posting...' : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>🚀 {t('post_job_btn')}</span>}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

export default CreateJob;
