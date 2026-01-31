const axios = require('axios');

async function testPhase9() {
    try {
        // 1. Setup Sender (Owner)
        const ownerMobile = 'PAY_OWNER_' + Math.floor(Math.random() * 1000000); // 6 digits unique
        const pin = '1234';
        let ownerToken;
        let ownerId;

        console.log(`Registering Owner: ${ownerMobile}...`);
        try {
            const regOwner = await axios.post('http://localhost:5000/api/auth/register', {
                name: 'Rich Owner',
                mobile: ownerMobile,
                pin,
                role: 'owner'
            });
            ownerToken = regOwner.data.token;
            ownerId = regOwner.data.user ? regOwner.data.user._id : (await axios.get('http://localhost:5000/api/auth/me', { headers: { Authorization: `Bearer ${ownerToken}` } })).data.data._id;
        } catch (e) {
            console.log('Owner reg failed, trying login...');
            const login = await axios.post('http://localhost:5000/api/auth/login', { mobile: ownerMobile, pin });
            ownerToken = login.data.token;
            ownerId = (await axios.get('http://localhost:5000/api/auth/me', { headers: { Authorization: `Bearer ${ownerToken}` } })).data.data._id;
        }

        // 2. Setup Receiver (Worker)
        const workerMobile = 'PAY_WORKER_' + Math.floor(Math.random() * 1000000);
        let workerToken;
        let workerId;

        console.log(`Registering Worker: ${workerMobile}...`);
        try {
            const regWorker = await axios.post('http://localhost:5000/api/auth/register', {
                name: 'Hard Worker',
                mobile: workerMobile,
                pin,
                role: 'worker'
            });
            workerToken = regWorker.data.token;
            workerId = regWorker.data.user ? regWorker.data.user._id : (await axios.get('http://localhost:5000/api/auth/me', { headers: { Authorization: `Bearer ${workerToken}` } })).data.data._id;
        } catch (e) {
            console.log('Worker reg failed, trying login...');
            const login = await axios.post('http://localhost:5000/api/auth/login', { mobile: workerMobile, pin });
            workerToken = login.data.token;
            workerId = (await axios.get('http://localhost:5000/api/auth/me', { headers: { Authorization: `Bearer ${workerToken}` } })).data.data._id;
        }

        // 3. Add Funds to Owner
        console.log('Adding ₹5000 to Owner...');
        await axios.post('http://localhost:5000/api/payments/add-funds', { amount: 5000 }, { headers: { Authorization: `Bearer ${ownerToken}` } });

        // Check Balance
        let ownerWallet = await axios.get('http://localhost:5000/api/payments/wallet', { headers: { Authorization: `Bearer ${ownerToken}` } });
        console.log('Owner Balance:', ownerWallet.data.data.wallet.balance); // 5000

        // 4. Pay Worker ₹500
        console.log(`Paying Worker (${workerId}) ₹500...`);
        try {
            await axios.post('http://localhost:5000/api/payments/pay-worker', {
                workerId,
                amount: 500,
                pin: '1234'
            }, { headers: { Authorization: `Bearer ${ownerToken}` } });
            console.log('Payment Successful.');
        } catch (e) {
            console.log('Payment Failed:', e.response ? e.response.data : e.message);
            return;
        }

        // 5. Verify Balances
        ownerWallet = await axios.get('http://localhost:5000/api/payments/wallet', { headers: { Authorization: `Bearer ${ownerToken}` } });
        let workerWallet = await axios.get('http://localhost:5000/api/payments/wallet', { headers: { Authorization: `Bearer ${workerToken}` } });

        console.log('Owner Balance (After):', ownerWallet.data.data.wallet.balance); // 4500
        console.log('Worker Balance (After):', workerWallet.data.data.wallet.balance); // 500

        // 6. Security Test: Insufficient Funds
        console.log('Attempting Overdraft Payment (₹10000)...');
        try {
            await axios.post('http://localhost:5000/api/payments/pay-worker', {
                workerId,
                amount: 10000,
                pin: '1234'
            }, { headers: { Authorization: `Bearer ${ownerToken}` } });
        } catch (e) {
            console.log('Overdraft Blocked:', e.response ? e.response.data.message : e.message); // Should be Insufficient Balance
        }

        // 7. Worker Withdraws
        console.log('Worker Withdrawing ₹200...');
        await axios.post('http://localhost:5000/api/payments/withdraw', { amount: 200 }, { headers: { Authorization: `Bearer ${workerToken}` } });
        workerWallet = await axios.get('http://localhost:5000/api/payments/wallet', { headers: { Authorization: `Bearer ${workerToken}` } });
        console.log('Worker Balance (Final):', workerWallet.data.data.wallet.balance); // 300

    } catch (error) {
        if (error.response) {
            console.log('Top Level Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Top Level Error Message:', error.message);
            console.log('Stack:', error.stack);
        }
    }
}

testPhase9();
