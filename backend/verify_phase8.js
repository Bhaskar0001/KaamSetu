const axios = require('axios');

async function testPhase8() {
    try {
        // 1. Setup Owner
        const ownerMobile = 'CONTRACTOWNER' + Math.floor(Math.random() * 10000); // 4 digits
        const pin = '1234';
        let ownerToken;
        try {
            const regRes = await axios.post('http://localhost:5000/api/auth/register', {
                name: 'Contract Owner',
                mobile: ownerMobile,
                pin,
                role: 'owner'
            });
            ownerToken = regRes.data.token;
        } catch (e) {
            ownerToken = (await axios.post('http://localhost:5000/api/auth/login', { mobile: ownerMobile, pin })).data.token;
        }

        // 2. Setup Worker
        const workerMobile = 'CONTRACTWORKER' + Math.floor(Math.random() * 10000);
        let workerToken;
        let workerId;
        try {
            const regRes = await axios.post('http://localhost:5000/api/auth/register', {
                name: 'Contract Worker',
                mobile: workerMobile,
                pin,
                role: 'worker'
            });
            workerToken = regRes.data.token;
            workerId = regRes.data.user ? regRes.data.user._id : (await axios.get('http://localhost:5000/api/auth/me', { headers: { Authorization: `Bearer ${workerToken}` } })).data.data._id;
        } catch (e) {
            const login = await axios.post('http://localhost:5000/api/auth/login', { mobile: workerMobile, pin });
            workerToken = login.data.token;
            workerId = (await axios.get('http://localhost:5000/api/auth/me', { headers: { Authorization: `Bearer ${workerToken}` } })).data.data._id;
        }

        // 3. Create Job
        const jobRes = await axios.post('http://localhost:5000/api/jobs', {
            title: 'Contract Job',
            description: 'Testing PDF',
            jobType: 'contract',
            wage: 1500,
            location: { address: 'Site C', lat: 28.6, lng: 77.2 },
            requiredSkills: ['Any'],
            date: '2024-12-30'
        }, { headers: { Authorization: `Bearer ${ownerToken}` } });
        const jobId = jobRes.data.data._id;

        // 4. Generate Contract
        console.log('Generating Contract...');
        const contractRes = await axios.post('http://localhost:5000/api/contracts', {
            jobId,
            workerId
        }, { headers: { Authorization: `Bearer ${ownerToken}` } });

        console.log('Contract Generated:', contractRes.data.data.pdfUrl);
        console.log('Status:', contractRes.data.data.status);

    } catch (error) {
        if (error.response) {
            console.log('Error Data:', JSON.stringify(error.response.data, null, 2));
            console.log('Error Status:', error.response.status);
        } else {
            console.log('Error Message:', error.message);
            console.log('Stack:', error.stack);
        }
    }
}

testPhase8();
