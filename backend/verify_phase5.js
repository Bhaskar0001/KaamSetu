const axios = require('axios');

async function testPhase5() {
    try {
        // 1. Get Worker Token (from prev step or login)
        const mobile = '883141551';
        let token;
        try {
            const loginRes = await axios.post('http://localhost:5000/api/auth/login', { mobile, pin: '1234' });
            token = loginRes.data.token;
        } catch (e) {
            console.log('Worker need reg...');
            const unique = Math.floor(Math.random() * 100000);
            const regRes = await axios.post('http://localhost:5000/api/auth/register', {
                name: 'Attendance Tester',
                mobile: `555${unique}`,
                pin: '1234',
                role: 'worker'
            });
            token = regRes.data.token;
        }

        // 2. Get Owner Token
        const ownerMobile = '7774781491';
        let ownerToken;
        try {
            const ownerLogin = await axios.post('http://localhost:5000/api/auth/login', { mobile: ownerMobile, pin: '1234' });
            ownerToken = ownerLogin.data.token;
        } catch (e) {
            console.log('Owner need reg...');
            const unique = Math.floor(Math.random() * 100000);
            const regRes = await axios.post('http://localhost:5000/api/auth/register', {
                name: 'Owner Att',
                mobile: `777${unique}`,
                pin: '1234',
                role: 'owner'
            });
            ownerToken = regRes.data.token;
        }

        // Create a NEW job to be sure
        const jobRes = await axios.post('http://localhost:5000/api/jobs', {
            title: 'Attendance Job',
            description: 'Test attendance',
            jobType: 'direct',
            wage: 500,
            location: { address: 'Site A', lat: 28.5, lng: 77.0 },
            requiredSkills: ['Helper'],
            date: '2024-12-20'
        }, { headers: { Authorization: `Bearer ${ownerToken}` } });
        const jobId = jobRes.data.data._id;

        // 3. Mark Attendance (Within Range)
        console.log('Marking Attendance (In Range)...');
        const attRes = await axios.post('http://localhost:5000/api/attendance/check-in', {
            jobId,
            lat: 28.5001, // Very close
            lng: 77.0001,
            selfieUrl: '/uploads/selfie.jpg',
            timestamp: Date.now()
        }, { headers: { Authorization: `Bearer ${token}` } });

        console.log('Status (In Range):', attRes.data.data.status); // Should be 'present'

        // 4. Mark Attendance (Out of Range)
        console.log('Marking Attendance (Far Away)...');
        const attRes2 = await axios.post('http://localhost:5000/api/attendance/check-in', {
            jobId,
            lat: 28.6, // Far
            lng: 77.1,
            selfieUrl: '/uploads/selfie.jpg',
            timestamp: Date.now()
        }, { headers: { Authorization: `Bearer ${token}` } });

        console.log('Status (Far):', attRes2.data.data.status); // Should be 'pending'

    } catch (error) {
        console.error('Test Phase 5 Failed:', error.response ? error.response.data : error.message);
    }
}

testPhase5();
