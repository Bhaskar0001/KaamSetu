import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        pin: '',
        confirmPin: '',
        role: 'worker' // Default role
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/');
        }
    }, [navigate]);

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (formData.pin !== formData.confirmPin) {
            setError('PINs do not match');
            toast.warning('PINs do not match');
            setIsLoading(false); // Ensure loading state is reset
            return;
        }

        if (formData.pin.length !== 4) {
            setError('PIN must be 4 digits');
            toast.warning('PIN must be 4 digits');
            setIsLoading(false); // Ensure loading state is reset
            return;
        }

        try {
            const { confirmPin, ...registerData } = formData;
            const res = await axios.post('http://localhost:5000/api/auth/register', registerData);

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user)); // Save user data

            toast.success('🎉 Registration successful!');

            // Redirect based on role
            const role = res.data.user.role;
            if (role === 'admin') navigate('/admin');
            else if (role === 'owner') navigate('/owner');
            else if (role === 'thekedar') navigate('/thekedar');
            else navigate('/worker');

        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='container'>
            <section className='heading'>
                <h1>📝 Register</h1>
                <p>Create your Majdoor account</p>
            </section>

            {error && <div className='error-box'>{error}</div>}

            <div className='card'>
                <form onSubmit={onSubmit}>
                    <div className='form-group'>
                        <label>👤 Full Name</label>
                        <input
                            type='text'
                            className='form-control'
                            name='name'
                            value={formData.name}
                            placeholder='Enter your name'
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label>📱 Mobile Number</label>
                        <input
                            type='text'
                            className='form-control'
                            name='mobile'
                            value={formData.mobile}
                            placeholder='Enter mobile number'
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label>👷 Role</label>
                        <select
                            className='form-control'
                            name='role'
                            value={formData.role}
                            onChange={onChange}
                        >
                            <option value='worker'>👷 Worker (Majdoor)</option>
                            <option value='thekedar'>🧱 Thekedar (Contractor)</option>
                            <option value='owner'>🏢 Owner / Company</option>
                        </select>
                    </div>
                    <div className='form-group'>
                        <label>🔢 Create PIN (4 digits)</label>
                        <input
                            type='password'
                            className='form-control'
                            name='pin'
                            value={formData.pin}
                            placeholder='Create 4-digit PIN'
                            onChange={onChange}
                            maxLength={4}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label>🔢 Confirm PIN</label>
                        <input
                            type='password'
                            className='form-control'
                            name='confirmPin'
                            value={formData.confirmPin}
                            placeholder='Confirm PIN'
                            onChange={onChange}
                            maxLength={4}
                            required
                        />
                    </div>
                    <button type='submit' className='btn btn-primary btn-block' disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : '✅ Register'}
                    </button>
                </form>
            </div>

            <p className='text-center text-muted mt-md'>
                Already have an account? <a href='/login'>Login here</a>
            </p>
        </div>
    );
}

export default Register;
