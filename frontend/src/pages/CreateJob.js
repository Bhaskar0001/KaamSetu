import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

function CreateJob() {
    const { t, language, changeLanguage } = useLanguage();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        jobType: 'direct',
        wage: '',
        address: '',
        requiredSkills: '', // comma separated
        date: '',
    });

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

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            };

            const jobData = {
                ...formData,
                requiredSkills: requiredSkills.split(',').map((s) => s.trim()),
                location: { address }, // Simplified for now
            };

            await axios.post('http://localhost:5000/api/jobs', jobData, config);
            alert(t('success'));
            navigate('/');
        } catch (err) {
            alert(t('error'));
            console.error(err);
        }
    };

    const toggleLang = () => {
        changeLanguage(language === 'en' ? 'hi' : 'en');
    };

    return (
        <>
            <section className='heading' style={{ position: 'relative' }}>
                <button
                    onClick={toggleLang}
                    className='btn btn-sm btn-outline'
                    style={{ position: 'absolute', right: 0, top: 0, background: 'white', color: 'black' }}
                >
                    {language === 'en' ? '🇮🇳 HI' : '🇺🇸 EN'}
                </button>
                <h1>{t('post_job')}</h1>
                <p>{t('find_best_workers')}</p>
            </section>

            <section className='form'>
                <form onSubmit={onSubmit}>
                    <div className='form-group'>
                        <label>{t('job_title')}</label>
                        <input
                            type='text'
                            name='title'
                            value={title}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label>{t('description')}</label>
                        <textarea
                            name='description'
                            value={description}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label>{t('job_type')}</label>
                        <select name='jobType' value={jobType} onChange={onChange}>
                            <option value='direct'>{t('direct_hire')}</option>
                            <option value='bid'>{t('bidding')}</option>
                            <option value='contract'>{t('contract_long')}</option>
                        </select>
                    </div>
                    <div className='form-group'>
                        <label>{t('wage_budget')}</label>
                        <input
                            type='number'
                            name='wage'
                            value={wage}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label>{t('location_address')}</label>
                        <input
                            type='text'
                            name='address'
                            value={address}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label>{t('skills_required')}</label>
                        <input
                            type='text'
                            name='requiredSkills'
                            value={requiredSkills}
                            onChange={onChange}
                            placeholder={t('skills_placeholder')}
                        />
                    </div>
                    <div className='form-group'>
                        <label>{t('date')}</label>
                        <input
                            type='date'
                            name='date'
                            value={date}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <button type='submit' className='btn btn-block'>
                            {t('post_job_btn')}
                        </button>
                    </div>
                </form>
            </section>
        </>
    );
}

export default CreateJob;
