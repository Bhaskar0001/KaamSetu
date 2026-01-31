const axios = require('axios');

async function testPhase7() {
    try {
        // 1. Setup Owner
        const ownerMobile = 'MATCHOWNER' + Math.floor(Math.random() * 10000);
        const pin = '1234';
        let ownerToken;

        try {
            const regRes = await axios.post('http://localhost:5000/api/auth/register', {
                name: 'Matching Owner',
                mobile: ownerMobile,
                pin,
                role: 'owner'
            });
            ownerToken = regRes.data.token;
        } catch (e) {
            ownerToken = (await axios.post('http://localhost:5000/api/auth/login', { mobile: ownerMobile, pin })).data.token;
        }

        // 2. Create Job A (Requires Mason, in Delhi)
        await axios.post('http://localhost:5000/api/jobs', {
            title: 'Mason Needed in Delhi',
            description: 'Brick work',
            jobType: 'direct',
            wage: 800,
            location: { address: 'Delhi', lat: 28.6, lng: 77.2 },
            requiredSkills: ['Mason'],
            date: '2024-12-25'
        }, { headers: { Authorization: `Bearer ${ownerToken}` } });

        // 3. Create Worker A (Mason, in Delhi) -> Should be High Match
        const mobileA = 'WORKER_A_' + Math.floor(Math.random() * 10000);
        let tokenA;
        try {
            const regA = await axios.post('http://localhost:5000/api/auth/register', {
                name: 'Mason Delhi',
                mobile: mobileA,
                pin,
                role: 'worker'
            });
            tokenA = regA.data.token;
        } catch (e) {
            tokenA = (await axios.post('http://localhost:5000/api/auth/login', { mobile: mobileA, pin })).data.token;
        }

        // Update profile
        await axios.put('http://localhost:5000/api/auth/profile', {
            skills: 'Mason',
            location: { address: 'Delhi', lat: 28.601, lng: 77.201 } // Very close
        }, { headers: { Authorization: `Bearer ${tokenA}` } });

        // 4. Create Worker B (Painter, in Mumbai) -> Should be Low Match
        const mobileB = 'WORKER_B_' + Math.floor(Math.random() * 10000);
        let tokenB;
        try {
            const regB = await axios.post('http://localhost:5000/api/auth/register', {
                name: 'Painter Mumbai',
                mobile: mobileB,
                pin,
                role: 'worker'
            });
            tokenB = regB.data.token;
        } catch (e) {
            tokenB = (await axios.post('http://localhost:5000/api/auth/login', { mobile: mobileB, pin })).data.token;
        }
        await axios.put('http://localhost:5000/api/auth/profile', {
            skills: 'Painter', // No skill match
            location: { address: 'Mumbai', lat: 19.0, lng: 72.8 } // Far
        }, { headers: { Authorization: `Bearer ${tokenB}` } });

        // 5. Check Matches for Worker A
        console.log('Checking Matches for Worker A (Mason/Delhi)...');
        const matchesA = await axios.get('http://localhost:5000/api/matches/worker', {
            headers: { Authorization: `Bearer ${tokenA}` }
        });
        const bestJobA = matchesA.data.data.find(j => j.job.title === 'Mason Needed in Delhi');
        const scoreA = bestJobA ? bestJobA.score : 0;
        console.log('Worker A Score:', scoreA); // Expect > 80

        // 6. Check Matches for Worker B
        console.log('Checking Matches for Worker B (Painter/Mumbai)...');
        const matchesB = await axios.get('http://localhost:5000/api/matches/worker', {
            headers: { Authorization: `Bearer ${tokenB}` }
        });
        const bestJobB = matchesB.data.data.find(j => j.job.title === 'Mason Needed in Delhi');
        const scoreB = bestJobB ? bestJobB.score : 0;
        console.log('Worker B Score:', scoreB); // Expect < 50

        if (scoreA > scoreB) console.log('SUCCESS: Algorithm correctly prioritized Worker A.');
        else console.log('FAIL: Scoring logic issue.');

    } catch (error) {
        console.log('Error:', error.response ? error.response.data : error.message);
    }
}

testPhase7();
