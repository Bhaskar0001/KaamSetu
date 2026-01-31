const Attendance = require('../models/Attendance');
const Job = require('../models/Job');

// Helper to calculate distance (Haversine formula)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

exports.deleteAttendance = async (req, res) => {
    try {
        // For testing/admin only
        await Attendance.findOneAndDelete({ job: req.params.jobId, worker: req.user.id });
        res.status(200).json({ success: true, message: 'Attendance deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const fraudEngine = require('../utils/fraudEngine');

// @desc    Mark Check-In
// @route   POST /api/attendance/check-in
// @access  Private (Worker)
exports.markAttendance = async (req, res) => {
    try {
        const { jobId, status, location, selfieUrl } = req.body;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        console.log('DEBUG: Job Location:', job.location);
        console.log('DEBUG: User Location:', location);

        // GEO-FENCING LOGIC
        if (location && job.location && job.location.lat && job.location.lng) {
            const distance = getDistanceFromLatLonInKm(
                location.lat,
                location.lng,
                job.location.lat,
                job.location.lng
            );

            // Allow 500 meters radius
            if (distance > 0.5) {
                return res.status(400).json({
                    success: false,
                    message: `Location mismatch! You are ${distance.toFixed(2)}km away from site.`
                });
            }
        }

        // Check if already marked for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existing = await Attendance.findOne({
            worker: req.user.id,
            job: jobId,
            date: { $gte: today }
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'Attendance already marked for today' });
        }

        // FRAUD DETECTION (GPS Speed)
        const analysis = await fraudEngine.analyzeCheckIn(
            req.user,
            job,
            { lat: location.lat, lng: location.lng },
            Date.now()
        );

        if (analysis.isFraud) {
            console.log(`FRAUD DETECTED: User ${req.user.id} - ${analysis.reasons.join(', ')}`);
            await fraudEngine.logFraud(req.user.id, 'check_in', analysis.riskScore, analysis.reasons, { location });

            // Reject if risk is too high (e.g. Speed Fraud)
            if (analysis.riskScore >= 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Suspicious activity detected! Please check-in normally.'
                });
            }
        }

        const attendance = await Attendance.create({
            worker: req.user.id,
            job: jobId,
            date: Date.now(),
            checkInTime: Date.now(),
            checkInLocation: { lat: location?.lat, lng: location?.lng }, // mapping correctly
            location, // Also store full object
            selfieUrl,
            status,
            verificationMethod: (location && selfieUrl) ? 'face_geo' : 'manual'
        });

        // Log this location for future speed checks
        await fraudEngine.logFraud(req.user.id, 'check_in', 0, [], { location });

        res.status(201).json({ success: true, data: attendance });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Sync Offline Attendance
// @route   POST /api/attendance/sync
// @access  Private (Worker)
exports.syncAttendance = async (req, res) => {
    try {
        const { records } = req.body; // Array of { jobId, timestamp, location, selfieUrl }

        if (!records || !Array.isArray(records)) {
            return res.status(400).json({ success: false, message: 'Invalid data format' });
        }

        const synced = [];
        const errors = [];

        for (const rec of records) {
            try {
                // Basic validation
                const job = await Job.findById(rec.jobId);
                if (!job) throw new Error(`Job ${rec.jobId} not found`);

                const attendance = await Attendance.create({
                    worker: req.user.id,
                    job: rec.jobId,
                    date: rec.timestamp, // Use past time
                    checkInTime: rec.timestamp,
                    checkInLocation: rec.location,
                    location: rec.location,
                    selfieUrl: rec.selfieUrl,
                    status: 'present',
                    verificationMethod: 'offline_sync',
                    isSynced: true
                });
                synced.push(attendance._id);

            } catch (err) {
                errors.push({ id: rec.jobId, error: err.message });
            }
        }

        res.status(200).json({ success: true, syncedCount: synced.length, errors });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
