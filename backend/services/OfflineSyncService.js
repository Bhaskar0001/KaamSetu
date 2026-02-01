const crypto = require('crypto');
const Attendance = require('../models/Attendance');
const Worker = require('../models/User');

class OfflineSyncService {
    constructor() {
        // In prod, fetch from User/Device record
        this.getDeviceSecret = (userId) => 'default_secret_dev';
    }

    validateSignature(payload, signature, userId) {
        const secret = this.getDeviceSecret(userId);

        // Reconstruct data string (deterministic sort)
        const orderedPayload = Object.keys(payload).sort().reduce(
            (obj, key) => {
                obj[key] = payload[key];
                return obj;
            },
            {}
        );
        const dataString = JSON.stringify(orderedPayload);

        // Verify HMAC
        const expectedSig = crypto.createHmac('sha256', secret)
            .update(dataString)
            .digest('hex');

        return expectedSig === signature;
    }

    async processBatch(batch, userId) {
        const results = { success: 0, failed: 0, errors: [] };

        for (const item of batch) {
            try {
                const { payload, signature } = item;

                // 1. Validate Signature
                if (!this.validateSignature(payload, signature, userId)) {
                    throw new Error('Invalid Signature - Potential Tampering');
                }

                // 2. Check for Replay (Idempotency)
                // Use payload.id (local ID) or timestamp+user combo
                const exists = await Attendance.findOne({
                    worker: userId,
                    date: { $gte: new Date(payload.timestamp - 60000), $lte: new Date(payload.timestamp + 60000) }
                });

                if (exists) {
                    // Already synced, skip but count as success to clear local queue
                    results.success++;
                    continue;
                }

                // 3. Commit to DB
                await Attendance.create({
                    worker: userId,
                    site: payload.siteId, // Assuming Site ID passed
                    location: payload.location,
                    status: 'present',
                    date: new Date(payload.timestamp),
                    isOfflineSync: true
                });

                results.success++;

            } catch (err) {
                console.error("Sync Error:", err.message);
                results.failed++;
                results.errors.push({ id: item.localId, error: err.message });
            }
        }
        return results;
    }
}

module.exports = new OfflineSyncService();
