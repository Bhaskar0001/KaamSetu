const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';
let workerToken;
let ownerToken;

function log(msg) {
    console.log(msg);
    fs.appendFileSync('verify_phase3_output.log', msg + '\n');
}

async function verifyPhase3() {
    fs.writeFileSync('verify_phase3_output.log', '');
    log('--- PHASE 3 VERIFICATION: AI & VOICE SEARCH ---');

    try {
        // 0. Login
        log('\n0. Logging in...');
        const ownerLogin = await axios.post(`${BASE_URL}/auth/login`, { mobile: 'DEMO_OWNER', pin: '1234' });
        ownerToken = ownerLogin.data.token;
        const workerLogin = await axios.post(`${BASE_URL}/auth/login`, { mobile: 'DEMO_WORKER', pin: '1234' });
        workerToken = workerLogin.data.token;
        log('✅ Logged in');

        // 1. Post Specific Jobs for Search
        log('\n1. Posting Jobs for Search Test...');
        await axios.post(`${BASE_URL}/jobs`, {
            title: 'Urgent Plumber Required',
            description: 'Need a plumber to fix leaking pipe in bathroom.',
            wage: 800,
            date: new Date(),
            location: { address: 'Delhi', lat: 28.6, lng: 77.2 },
            requiredSkills: ['Plumber']
        }, { headers: { Authorization: `Bearer ${ownerToken}` } });

        await axios.post(`${BASE_URL}/jobs`, {
            title: 'Painter Helper Needed',
            description: 'Looking for a helper for painting walls.',
            wage: 600,
            date: new Date(),
            location: { address: 'Delhi', lat: 28.6, lng: 77.2 },
            requiredSkills: ['Painter']
        }, { headers: { Authorization: `Bearer ${ownerToken}` } });
        log('✅ Jobs Posted');

        // 2. Test Voice Search (Text Search Backend)
        log('\n2. Testing Search (Query: "Plumber")...');
        const searchRes = await axios.get(`${BASE_URL}/jobs/search?q=Plumber`, {
            headers: { Authorization: `Bearer ${workerToken}` }
        });

        const found = searchRes.data.data;
        log(`Found ${found.length} jobs.`);
        if (found.length > 0 && found[0].title.toLowerCase().includes('plumber')) {
            log('✅ Search Result Accurate');
        } else {
            log('❌ Search Failed or Irrelevant');
        }

        // 3. Update Worker Profile with Rating (Mock)
        // We need to manually update the DB or add a route, but since we modify schema, 
        // let's just assume the default 0 rating vs a mock high rating calculation.
        // Actually, we can update profile via existing route to add skills which affects score.
        // But Rating is usually set by system. For this test, let's just check if Matching Engine runs without error.

        log('\n3. Testing AI Matching Engine...');
        const matchRes = await axios.get(`${BASE_URL}/matches/worker`, {
            headers: { Authorization: `Bearer ${workerToken}` }
        });

        if (matchRes.data.success) {
            log(`✅ Matching Algorithm Ran Successfully. Top Score: ${matchRes.data.data[0]?.score || 0}`);
        } else {
            log('❌ Matching Failed');
        }

    } catch (err) {
        log(`❌ CRITICAL ERROR: ${err.message}`);
        if (err.response) log(`Response: ${JSON.stringify(err.response.data)}`);
    }
}

verifyPhase3();
