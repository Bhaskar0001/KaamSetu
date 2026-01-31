const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';
let workerToken;
let ownerToken;
let jobId;

const fs = require('fs');

function log(msg) {
    console.log(msg);
    fs.appendFileSync('verify_output.log', msg + '\n');
}

async function verifyPhase1() {
    fs.writeFileSync('verify_output.log', ''); // Clear log
    log('--- PHASE 1 VERIFICATION: IDENTITY & TRUST ---');

    try {
        log('--- STARTING VERIFICATION ---');
        // 0. Login as Owner & Post Job
        log('0. Logging in as Owner...');
        let ownerLogin;
        try {
            ownerLogin = await axios.post(`${BASE_URL}/auth/login`, {
                mobile: 'DEMO_OWNER',
                pin: '1234'
            });
            log(`Owner Login Response: ${ownerLogin.status}`);
            log(`Owner Login Body: ${JSON.stringify(ownerLogin.data, null, 2)}`);
        } catch (authErr) {
            log(`Owner Login Failed: ${authErr.message}`);
            throw authErr;
        }

        ownerToken = ownerLogin.data.token;
        log(`Owner Token: ${ownerToken ? 'Received' : 'Missing'}`);

        const jobRes = await axios.post(`${BASE_URL}/jobs`, {
            title: 'Verification Job',
            description: 'Test Job for Geo Fencing',
            wage: 500,
            date: new Date(),
            location: { address: 'Site A', lat: 28.6, lng: 77.2 },
            requiredSkills: ['General']
        }, { headers: { Authorization: `Bearer ${ownerToken}` } });

        jobId = jobRes.data.data._id;
        console.log(`✅ Job Created: ${jobId}`);

        // 1. Login as Worker
        console.log('\n1. Logging in as Worker...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            mobile: 'DEMO_WORKER',
            pin: '1234'
        });
        workerToken = loginRes.data.token;
        console.log('✅ Login Successful');

        // 2. Verify Identity (Mock)
        console.log('\n2. Verifying Identity (Aadhaar)...');
        try {
            const verifyRes = await axios.post(
                `${BASE_URL}/auth/verify-identity`,
                { aadhaarNumber: '123456789012' },
                { headers: { Authorization: `Bearer ${workerToken}` } }
            );
            console.log('✅ Identity Verified:', verifyRes.data.message);
        } catch (e) {
            console.log('ℹ️ Identity Verification:', e.response?.data?.message);
        }

        // 3. Get Specific Job for Attendance
        console.log('\n3. Getting Matches...');
        // We can just use the created jobId directly, but let's verify matching finds it
        const jobsRes = await axios.get(
            `${BASE_URL}/matches/worker`,
            { headers: { Authorization: `Bearer ${workerToken}` } }
        );

        const matchedJob = jobsRes.data.data.find(m => (m.job?._id === jobId || m._id === jobId));

        if (matchedJob) {
            console.log(`✅ Job Found in Matches`);
            const targetLat = 28.6;
            const targetLng = 77.2;

            // 4. Clean up previous attendance (if any)
            try {
                await axios.delete(
                    `${BASE_URL}/attendance/${jobId}`,
                    { headers: { Authorization: `Bearer ${workerToken}` } }
                );
            } catch (e) { }

            // 5. Mark Smart Attendance (Success Case)
            console.log('\n5. Marking Attendance (Correct Location)...');
            try {
                const attRes = await axios.post(
                    `${BASE_URL}/attendance/check-in`,
                    {
                        jobId: jobId,
                        status: 'present',
                        location: { lat: targetLat, lng: targetLng },
                        selfieUrl: 'http://mock-storage.com/selfie.jpg'
                    },
                    { headers: { Authorization: `Bearer ${workerToken}` } }
                );
                console.log('✅ Attendance Marked:', attRes.data.data.status);
            } catch (e) {
                console.log('❌ Attendance Failed:', e.response?.data?.message);
            }

            // 6. Delete again for next test
            await axios.delete(
                `${BASE_URL}/attendance/${jobId}`,
                { headers: { Authorization: `Bearer ${workerToken}` } }
            );

            // 7. Mark Smart Attendance (Fail Case - Geo Fence)
            console.log('\n7. Marking Attendance (Wrong Location)...');
            try {
                await axios.post(
                    `${BASE_URL}/attendance/check-in`,
                    {
                        jobId: jobId,
                        status: 'present',
                        location: { lat: 0, lng: 0 }, // Far away
                        selfieUrl: 'http://mock-storage.com/selfie.jpg'
                    },
                    { headers: { Authorization: `Bearer ${workerToken}` } }
                );
                console.log('❌ Geo-fence Failed: Should have rejected but accepted.');
            } catch (e) {
                console.log('✅ Geo-fence Worked (Rejected):', e.response?.data?.message);
            }

        } else {
            console.log('⚠️ Created Job not found in matches. Check matching logic.');
        }

    } catch (err) {
        console.error('CRITICAL ERROR:', err.message, err.response?.data);
    }
}

verifyPhase1();
