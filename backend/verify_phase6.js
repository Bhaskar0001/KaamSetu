const axios = require('axios');

async function testPhase6() {
    const mobile = 'FRAUD002'; // New user
    const pin = '1234';
    let token;

    try {
        // 1. Setup User
        try {
            const regRes = await axios.post('http://localhost:5000/api/auth/register', {
                name: 'Fraud Tester 2',
                mobile,
                pin,
                role: 'worker'
            });
            token = regRes.data.token;
        } catch (e) {
            const loginRes = await axios.post('http://localhost:5000/api/auth/login', { mobile, pin });
            token = loginRes.data.token;
        }

        // 2. Setup Job (Owner)
        const ownerMobile = 'OWNER002';
        let ownerToken;
        try {
            const regRes = await axios.post('http://localhost:5000/api/auth/register', {
                name: 'Owner Fraud 2',
                mobile: ownerMobile,
                pin: '1234',
                role: 'owner'
            });
            ownerToken = regRes.data.token;
        } catch (e) {
            const loginRes = await axios.post('http://localhost:5000/api/auth/login', { mobile: ownerMobile, pin: '1234' });
            ownerToken = loginRes.data.token;
        }

        const jobRes = await axios.post('http://localhost:5000/api/jobs', {
            title: 'Fraud Test Job 2',
            description: 'Testing fraud engine',
            jobType: 'direct',
            wage: 500,
            location: { address: 'Delhi', lat: 28.6, lng: 77.2 }, // Job in Delhi
            requiredSkills: ['Any'],
            date: '2024-12-25'
        }, { headers: { Authorization: `Bearer ${ownerToken}` } });
        const jobId = jobRes.data.data._id;

        // 3. Scenario 1: Normal Check-In
        console.log('Testing Normal Check-In...');
        await axios.post('http://localhost:5000/api/attendance/check-in', {
            jobId, lat: 28.6001, lng: 77.2001,
            selfieUrl: 'ok.jpg'
        }, { headers: { Authorization: `Bearer ${token}` } });

        // Wait a bit to ensure timestamp diff isn't 0 (though script is fast)
        await new Promise(r => setTimeout(r, 1000));

        // 4. Scenario 2: Teleportation (Mumbai check-in 1 sec later)
        console.log('Testing Teleportation (Mumbai)...');
        const fraudRes = await axios.post('http://localhost:5000/api/attendance/check-in', {
            jobId, lat: 19.07, lng: 72.87, // Mumbai
            selfieUrl: 'fraud.jpg'
        }, { headers: { Authorization: `Bearer ${token}` } });

        console.log('Fraud Analysis:', fraudRes.data.fraudAnalysis);
        console.log('Status:', fraudRes.data.data.status); // Should be flagged

    } catch (error) {
        console.log('Error:', error.response ? error.response.data : error.message);
    }
}

testPhase6();
