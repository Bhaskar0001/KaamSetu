const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');

class AuditService {
    async logEvent(action, user, details, req = {}) {
        try {
            // 1. Get previous log for hash chain
            const lastLog = await AuditLog.findOne().sort({ timestamp: -1 });
            const prevHash = lastLog ? lastLog.hash : 'GENESIS_HASH_0000';

            // 2. Create data string to hash
            const timestamp = new Date().toISOString();
            const dataToHash = `${prevHash}|${action}|${user ? user._id : 'system'}|${JSON.stringify(details)}|${timestamp}`;

            // 3. Generate SHA256 Hash
            const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');

            // 4. Save
            await AuditLog.create({
                action,
                userId: user ? user._id : null,
                details,
                ip: req.ip || 'internal',
                prevHash,
                hash,
                timestamp
            });

        } catch (err) {
            console.error("AUDIT FAILURE:", err);
            // In critical systems, we might halt here. For now, we log error.
        }
    }
}

module.exports = new AuditService();
