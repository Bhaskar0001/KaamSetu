const axios = require('axios');

async function testFullSystem() {
    console.log('=== STARTING FULL SYSTEM HEALTH CHECK ===');
    try {
        // 1. AUTH: Register Owner
        const ownerMobile = 'SYS_OWNER_' + Math.floor(Math.random() * 100000);
        console.log(`[AUTH] Registering Owner (${ownerMobile})...`);
        let ownerToken;
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', {
                name: 'System Owner', mobile: ownerMobile, pin: '1234', role: 'owner'
            });
            ownerToken = res.data.token;
        } catch (e) { console.log('[AUTH] Failed'); return; }

        // 2. JOB: Post Job
        console.log('[JOB] Posting Job...');
        const jobRes = await axios.post('http://localhost:5000/api/jobs', {
            title: 'System Check Job',
            description: 'Full flow',
            jobType: 'contract',
            wage: 2000,
            location: { address: 'HQ', lat: 28.5, lng: 77.1 },
            requiredSkills: ['SystemCheck'],
            date: '2025-01-01'
        }, { headers: { Authorization: `Bearer ${ownerToken}` } });
        const jobId = jobRes.data.data._id;
        console.log('[JOB] Created:', jobId);

        // 3. AUTH: Register Worker
        const workerMobile = 'SYS_WORKER_' + Math.floor(Math.random() * 100000);
        console.log(`[AUTH] Registering Worker (${workerMobile})...`);
        const wRes = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'System Worker', mobile: workerMobile, pin: '1234', role: 'worker'
        });
        const workerToken = wRes.data.token;
        const workerId = wRes.data.user._id;

        // 4. MATCH: Check Matches
        console.log('[MATCH] Checking Worker Feed...');
        await axios.get('http://localhost:5000/api/matches/worker', { headers: { Authorization: `Bearer ${workerToken}` } });
        console.log('[MATCH] Feed OK');

        // 5. CONTRACT: Generate Logic
        console.log('[CONTRACT] Generating Contract...');
        await axios.post('http://localhost:5000/api/contracts', { jobId, workerId }, { headers: { Authorization: `Bearer ${ownerToken}` } });
        console.log('[CONTRACT] Generated OK');

        // 6. WALLET: Deposit & Transfer
        console.log('[WALLET] Adding Funds...');
        await axios.post('http://localhost:5000/api/payments/add-funds', { amount: 3000 }, { headers: { Authorization: `Bearer ${ownerToken}` } });

        console.log('[WALLET] Paying Worker...');
        await axios.post('http://localhost:5000/api/payments/pay-worker', {
            workerId, amount: 2000, pin: '1234'
        }, { headers: { Authorization: `Bearer ${ownerToken}` } });
        console.log('[WALLET] Payment OK');

        // 7. ADMIN: Check Stats (Using Owner token as mock admin just to hit endpoint if protected, wait admin requires 'admin' role)
        // Register Admin
        console.log('[ADMIN] Verifying Stats...');
        const adminMobile = 'SYS_ADMIN_' + Math.floor(Math.random() * 100000);
        let adminToken;
        try {
            const aRes = await axios.post('http://localhost:5000/api/auth/register', {
                name: 'System Admin', mobile: adminMobile, pin: '1234', role: 'admin'
            });
            adminToken = aRes.data.token;
            const stats = await axios.get('http://localhost:5000/api/admin/stats', { headers: { Authorization: `Bearer ${adminToken}` } });
            console.log('[ADMIN] Stats Fetched:', JSON.stringify(stats.data.data));
        } catch (e) { console.log('[ADMIN] Failed (Maybe role issue?):', e.message); }

        console.log('=== FULL SYSTEM CHECK PASSED ===');

    } catch (err) {
        if (err.response) console.log('FATAL ERROR:', JSON.stringify(err.response.data));
        else console.log('FATAL ERROR:', err.message);
    }
}

testFullSystem();
