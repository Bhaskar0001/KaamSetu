const Device = require('../models/Device');

// Middleware to evaluate Device Trust on sensitive routes
exports.evaluateDeviceTrust = async (req, res, next) => {
    try {
        // Assume Client sends 'x-device-id' header
        constdeviceId = req.headers['x-device-id'] || 'unknown_device';
        const userAgent = req.headers['user-agent'];
        const ip = req.ip;

        if (!req.user) return next(); // Should be used after 'protect' middleware

        let device = await Device.findOne({ user: req.user.id, deviceId: constdeviceId });

        if (!device) {
            // Register new device
            device = await Device.create({
                user: req.user.id,
                deviceId: constdeviceId,
                fingerprint: {
                    userAgent,
                    ip
                },
                trustScore: 90 // New devices start slightly lower? Or 100? Let's say 90.
            });
        } else {
            // Update Last Seen
            device.lastSeen = Date.now();

            // Simple detecting: If IP changed drastically (Country level) -> Reduce Score (Mock logic)
            // if (device.fingerprint.ip !== ip) ...

            await device.save();
        }

        // Attach trust info to request for controllers to use
        req.deviceTrust = {
            deviceId: device.deviceId,
            score: device.trustScore,
            isBlocked: device.isBlocked
        };

        if (device.isBlocked) {
            return res.status(403).json({ success: false, message: 'Device Blocked due to suspicious activity.' });
        }

        next();
    } catch (err) {
        console.error("Device Trust Error:", err);
        next(); // Don't block flow on error, but maybe log it
    }
};
