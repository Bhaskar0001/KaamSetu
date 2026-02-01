const http = require('http');

const makeRequest = (path, method, data) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
};

const runTest = async () => {
    try {
        const uniqueId = Date.now().toString().slice(-6);
        const mobile = '9' + uniqueId + '000'; // Random mobile
        const aadhaar = '1234' + uniqueId + '56'; // 12 digit

        console.log(`Testing Registration with Mobile: ${mobile}, Aadhaar: ${aadhaar}`);

        // 1. Register
        const regRes = await makeRequest('/register', 'POST', {
            name: 'Test User ' + uniqueId,
            mobile: mobile,
            pin: '1234',
            role: 'worker',
            aadhaarNumber: aadhaar
        });

        if (regRes.status !== 200 && regRes.status !== 201) {
            console.error('FAILED: Registration failed', regRes.data);
            process.exit(1);
        }
        console.log('SUCCESS: Registration passed', regRes.data.success);

        // 2. Login
        console.log('Testing Login...');
        const loginRes = await makeRequest('/login', 'POST', {
            mobile: mobile,
            pin: '1234'
        });

        if (loginRes.status !== 200) {
            console.error('FAILED: Login failed', loginRes.data);
            process.exit(1);
        }

        console.log('SUCCESS: Login passed. Token received:', !!loginRes.data.token);
        console.log('User Data from DB:', loginRes.data.user);

    } catch (err) {
        console.error('Script Error:', err);
    }
};

runTest();
