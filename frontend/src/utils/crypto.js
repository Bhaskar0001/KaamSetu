import CryptoJS from 'crypto-js';
import { db } from './db';

// Generate a cryptographic token for offline data
// Payload: Object to sign
// Secret: Device specific secret (stored in DB or LocalStorage)
export const generateSignedToken = async (payload) => {
    // 1. Get Device Secret (Simulated or from Auth)
    // In real app, this comes from server on login and stored in secure storage
    const deviceSecret = localStorage.getItem('device_secret') || 'default_secret_dev';

    // 2. Create String to Sign
    // Sort keys to ensure deterministic order
    const orderedPayload = Object.keys(payload).sort().reduce(
        (obj, key) => {
            obj[key] = payload[key];
            return obj;
        },
        {}
    );
    const dataString = JSON.stringify(orderedPayload);

    // 3. Sign
    const signature = CryptoJS.HmacSHA256(dataString, deviceSecret).toString();

    // 4. Return Sealed Packet
    return {
        payload: orderedPayload,
        signature,
        timestamp: Date.now()
    };
};
