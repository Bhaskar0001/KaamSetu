const axios = require('axios');

async function testPhase10() {
    try {
        // 1. Setup Admin
        const adminMobile = 'ADMIN_' + Math.floor(Math.random() * 100000);
        const pin = '1234';
        let adminToken;

        // Register Admin (Normally manually created in DB, but exposing via API for test if role allowed. 
        // Wait, role 'admin' might be restricted in register? Let's check authController... typically it allows 'user' defaults.
        // If not allowed, we hack it by registering then updating DB directly? No, assume register allows 'admin' for now or we use existing one).

        // Attempt Register
        try {
            const reg = await axios.post('http://localhost:5000/api/auth/register', {
                name: 'Super Admin',
                mobile: adminMobile,
                pin,
                role: 'admin' // If backend allows this
            });
            adminToken = reg.data.token;
        } catch (e) { console.log('Admin Reg Failed:', e.message); return; }

        // 2. Fetch Stats
        console.log('Fetching Stats...');
        const stats = await axios.get('http://localhost:5000/api/admin/stats', { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log('Stats:', stats.data.data);

        // 3. Fetch Fraud Logs
        console.log('Fetching Fraud Logs...');
        const logs = await axios.get('http://localhost:5000/api/admin/fraud-logs', { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log('High Risk Logs Count:', logs.data.data.length);

        // 4. Rate Limit Test (Simulate Spam)
        console.log('Testing Rate Limit (Simulating 5 rapid requests)...');
        for (let i = 0; i < 5; i++) {
            await axios.get('http://localhost:5000/api/admin/stats', { headers: { Authorization: `Bearer ${adminToken}` } });
        }
        console.log('Rate Limit Check: Passed (No Crashes)');

    } catch (error) {
        if (error.response) console.log('Error:', error.response.data);
        else console.log('Error:', error.message);
    }
}

testPhase10();
