const axios = require('axios');

const BASE = 'http://localhost:5000/api';

async function testAllEndpoints() {
    console.log('=== MAJDOOR API TESTING ===\n');

    let workerToken, ownerToken, adminToken;
    let testJobId;

    // 1. AUTH TESTS
    console.log('--- AUTH TESTS ---');

    // Worker Login
    try {
        const res = await axios.post(`${BASE}/auth/login`, { mobile: 'DEMO_WORKER', pin: '1234' });
        workerToken = res.data.token;
        console.log('✅ Worker Login: SUCCESS');
        console.log(`   User: ${res.data.user.name} (${res.data.user.role})`);
    } catch (e) {
        console.log('❌ Worker Login: FAILED -', e.response?.data?.message || e.message);
    }

    // Owner Login
    try {
        const res = await axios.post(`${BASE}/auth/login`, { mobile: 'DEMO_OWNER', pin: '1234' });
        ownerToken = res.data.token;
        console.log('✅ Owner Login: SUCCESS');
        console.log(`   User: ${res.data.user.name} (${res.data.user.role})`);
    } catch (e) {
        console.log('❌ Owner Login: FAILED -', e.response?.data?.message || e.message);
    }

    // Admin Login
    try {
        const res = await axios.post(`${BASE}/auth/login`, { mobile: 'DEMO_ADMIN', pin: '1234' });
        adminToken = res.data.token;
        console.log('✅ Admin Login: SUCCESS');
        console.log(`   User: ${res.data.user.name} (${res.data.user.role})`);
    } catch (e) {
        console.log('❌ Admin Login: FAILED -', e.response?.data?.message || e.message);
    }

    // 2. JOB TESTS
    console.log('\n--- JOB TESTS ---');

    // Create Job (Owner)
    if (ownerToken) {
        try {
            const res = await axios.post(`${BASE}/jobs`, {
                title: 'Test Construction Job',
                description: 'Building work needed',
                jobType: 'bid',
                wage: 500,
                requiredSkills: ['Mason', 'Helper'],
                location: { address: 'Delhi', lat: 28.6, lng: 77.2 },
                date: '2025-02-01'
            }, { headers: { Authorization: `Bearer ${ownerToken}` } });
            testJobId = res.data.data._id;
            console.log('✅ Create Job: SUCCESS');
            console.log(`   Job ID: ${testJobId}`);
        } catch (e) {
            console.log('❌ Create Job: FAILED -', e.response?.data?.message || e.message);
        }
    }

    // Get Job Feed (Worker)
    if (workerToken) {
        try {
            const res = await axios.get(`${BASE}/matches/worker`,
                { headers: { Authorization: `Bearer ${workerToken}` } });
            console.log('✅ Worker Job Feed: SUCCESS');
            console.log(`   Jobs Found: ${res.data.data?.length || 0}`);
        } catch (e) {
            console.log('❌ Worker Job Feed: FAILED -', e.response?.data?.message || e.message);
        }
    }

    // 3. WALLET TESTS
    console.log('\n--- WALLET TESTS ---');

    if (ownerToken) {
        try {
            const res = await axios.get(`${BASE}/payments/wallet`,
                { headers: { Authorization: `Bearer ${ownerToken}` } });
            console.log('✅ Owner Wallet: SUCCESS');
            console.log(`   Balance: ₹${res.data.data?.wallet?.balance || 0}`);
        } catch (e) {
            console.log('❌ Owner Wallet: FAILED -', e.response?.data?.message || e.message);
        }
    }

    // 4. ADMIN TESTS
    console.log('\n--- ADMIN TESTS ---');

    if (adminToken) {
        try {
            const res = await axios.get(`${BASE}/admin/stats`,
                { headers: { Authorization: `Bearer ${adminToken}` } });
            console.log('✅ Admin Stats: SUCCESS');
            console.log(`   Workers: ${res.data.data.workers}, Owners: ${res.data.data.owners}, Jobs: ${res.data.data.jobs}`);
        } catch (e) {
            console.log('❌ Admin Stats: FAILED -', e.response?.data?.message || e.message);
        }

        try {
            const res = await axios.get(`${BASE}/admin/fraud-logs`,
                { headers: { Authorization: `Bearer ${adminToken}` } });
            console.log('✅ Fraud Logs: SUCCESS');
            console.log(`   Logs Found: ${res.data.data?.length || 0}`);
        } catch (e) {
            console.log('❌ Fraud Logs: FAILED -', e.response?.data?.message || e.message);
        }
    }

    // 5. BID TEST
    console.log('\n--- BID TESTS ---');

    if (workerToken && testJobId) {
        try {
            const res = await axios.post(`${BASE}/bids/${testJobId}`,
                { amount: 450 },
                { headers: { Authorization: `Bearer ${workerToken}` } });
            console.log('✅ Place Bid: SUCCESS');
        } catch (e) {
            console.log('❌ Place Bid: FAILED -', e.response?.data?.message || e.message);
        }
    }

    console.log('\n=== TESTING COMPLETE ===');
}

testAllEndpoints();
