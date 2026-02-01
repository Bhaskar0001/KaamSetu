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
        const mobile = '9' + uniqueId + '999';
        const aadhaar = '8888' + uniqueId + '12'; // Valid 12 digit

        console.log(`Testing 2FA with Mobile: ${mobile}, Aadhaar: ${aadhaar}`);

        // 1. Send OTP
        console.log('1. Sending OTP...');
        const sendOtpRes = await makeRequest('/send-otp', 'POST', { mobile });
        if (!sendOtpRes.data.success) {
            console.error('FAILED: Send OTP', sendOtpRes.data);
            process.exit(1);
        }
        const otp = sendOtpRes.data.otp;
        console.log(`   OTP Received: ${otp}`);

        // 2. Verify OTP
        console.log('2. Verifying OTP...');
        const verifyOtpRes = await makeRequest('/verify-otp', 'POST', { mobile, otp });
        if (!verifyOtpRes.data.success) {
            console.error('FAILED: Verify OTP', verifyOtpRes.data);
            process.exit(1);
        }
        console.log('   Mobile Verified Successfully.');

        // 3. Verify Aadhaar
        console.log('3. Verifying Aadhaar...');
        const verifyAadhaarRes = await makeRequest('/verify-aadhaar-details', 'POST', { aadhaarNumber: aadhaar });
        if (!verifyAadhaarRes.data.success) {
            console.error('FAILED: Verify Aadhaar', verifyAadhaarRes.data);
            process.exit(1);
        }
        console.log('   Aadhaar Verified Successfully.');

        // 4. Register (Now that we are sure inputs are valid)
        console.log('4. Registering User...');
        const regRes = await makeRequest('/register', 'POST', {
            name: '2FA User ' + uniqueId,
            mobile: mobile,
            pin: '1234',
            role: 'worker',
            aadhaarNumber: aadhaar
        });

        if (regRes.status !== 200 && regRes.status !== 201) {
            console.error('FAILED: Registration failed', regRes.data);
            process.exit(1);
        }
        console.log('SUCCESS: Full Flow Verified!', regRes.data.success);

    } catch (err) {
        console.error('Script Error:', err);
    }
};

runTest();
