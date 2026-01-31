const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';
let workerToken;
let ownerToken;
let jobId;

function log(msg) {
    console.log(msg);
    fs.appendFileSync('verify_phase4_output.log', msg + '\n');
}

async function verifyPhase4() {
    fs.writeFileSync('verify_phase4_output.log', '');
    log('--- PHASE 4 VERIFICATION: RELIABILITY & SCALE ---');

    try {
        // 0. Login
        log('\n0. Logging in...');
        const ownerLogin = await axios.post(`${BASE_URL}/auth/login`, { mobile: 'DEMO_OWNER', pin: '1234' });
        ownerToken = ownerLogin.data.token;
        const workerLogin = await axios.post(`${BASE_URL}/auth/login`, { mobile: 'DEMO_WORKER', pin: '1234' });
        workerToken = workerLogin.data.token;
        log('✅ Logged in');

        // 1. Post Job
        const jobRes = await axios.post(`${BASE_URL}/jobs`, {
            title: 'Reliability Test Job',
            description: 'Testing Fraud & Sync',
            wage: 500,
            date: new Date(),
            location: { address: 'Delhi', lat: 28.6, lng: 77.2 },
            requiredSkills: ['General']
        }, { headers: { Authorization: `Bearer ${ownerToken}` } });
        jobId = jobRes.data.data._id;
        log(`✅ Test Job 1 Created: ${jobId}`);

        // 1.1 Post Job 2 (Mumbai)
        const job2Res = await axios.post(`${BASE_URL}/jobs`, {
            title: 'Mumbai Job',
            description: 'Teleportation Target',
            wage: 500,
            date: new Date(),
            location: { address: 'Mumbai', lat: 19.07, lng: 72.87 },
            requiredSkills: ['General']
        }, { headers: { Authorization: `Bearer ${ownerToken}` } });
        const job2Id = job2Res.data.data._id;
        log(`✅ Test Job 2 Created (Mumbai): ${job2Id}`);

        // 2. Initial Valid Check-in (Delhi - Job 1)
        log('\n2. Initial Check-in (Delhi - Job 1)...');
        await axios.post(`${BASE_URL}/attendance/check-in`, {
            jobId, status: 'present', location: { lat: 28.6, lng: 77.2 }, selfieUrl: 'http://img.com/1.jpg'
        }, { headers: { Authorization: `Bearer ${workerToken}` } });
        log('✅ Check-in 1 Successful');

        // 3. Fraud Check (Teleportation to Mumbai - Job 2)
        log('\n3. Testing Speed Fraud (Check-in Mumbai - Job 2 - 1 min later)...');
        try {
            await axios.post(`${BASE_URL}/attendance/check-in`, {
                jobId: job2Id, status: 'present',
                location: { lat: 19.07, lng: 72.87 }, // Valid for Job 2
                selfieUrl: 'http://img.com/2.jpg'
            }, { headers: { Authorization: `Bearer ${workerToken}` } });
            log('❌ Fraud Detection Failed (Should have rejected)');
        } catch (err) {
            log(`✅ Fraud Rejected (Expected): ${err.response?.data?.message}`);
        }

        // 4. Offline Sync
        log('\n4. Testing Offline Sync...');
        const syncRes = await axios.post(`${BASE_URL}/attendance/sync`, {
            records: [
                {
                    jobId,
                    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
                    location: { lat: 28.6, lng: 77.2 }, // Valid location
                    selfieUrl: 'http://img.com/offline.jpg'
                }
            ]
        }, { headers: { Authorization: `Bearer ${workerToken}` } });

        log(`Sync Result: ${syncRes.data.syncedCount} records synced.`);
        if (syncRes.data.errors.length > 0) {
            log(`Sync Errors: ${JSON.stringify(syncRes.data.errors)}`);
        }

        if (syncRes.data.syncedCount === 1) {
            log('✅ Offline Sync Successful');
        } else {
            log('❌ Offline Sync Failed');
        }

    } catch (err) {
        log(`❌ CRITICAL ERROR: ${err.message}`);
        if (err.response) log(`Response: ${JSON.stringify(err.response.data)}`);
    }
}

verifyPhase4();
