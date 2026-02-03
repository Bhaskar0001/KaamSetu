const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const verifyengagement = async () => {
    try {
        console.log('1. Logging in as Worker...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            mobile: 'DEMO_WORKER',
            pin: '1234'
        });

        const token = loginRes.data.token;
        console.log('✅ Login Successful. Token obtained.');

        console.log('\n2. Fetching Today Screen Data...');
        const todayRes = await axios.get(`${API_URL}/engagement/today`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Today Data Received:');
        console.log(JSON.stringify(todayRes.data.data, null, 2));

        if (todayRes.data.data.role === 'worker') {
            console.log('\n✅ Role Verified: Worker');
        } else {
            console.error('❌ Role Mismatch');
        }

    } catch (err) {
        console.error('❌ Verification Failed:', err.response ? err.response.data : err.message);
    }
};

verifyengagement();
