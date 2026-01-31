const FraudLog = require('../models/FraudLog');
const User = require('../models/User');

// Helper to calculate distance
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    var R = 6371;
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

const fraudEngine = {
    analyzeCheckIn: async (user, job, checkInLocation, timestamp) => {
        let riskScore = 0;
        let reasons = [];

        // 1. Distance Check
        const distance = getDistanceFromLatLonInKm(
            checkInLocation.lat, checkInLocation.lng,
            job.location.lat, job.location.lng
        );

        if (distance > 0.5) { // 500m logic is handled in controller, but logging here too
            riskScore += 80;
            reasons.push(`Check-in ${distance.toFixed(1)}km away`);
        }

        // 2. Teleportation Check (Rapid movement)
        const lastLog = await FraudLog.findOne({ user: user._id, action: 'check_in' }).sort({ createdAt: -1 });

        if (lastLog && lastLog.metadata && lastLog.metadata.location) {
            const timeDiff = (timestamp - new Date(lastLog.createdAt).getTime()) / (1000 * 60); // minutes
            const distDiff = getDistanceFromLatLonInKm(
                checkInLocation.lat, checkInLocation.lng,
                lastLog.metadata.location.lat, lastLog.metadata.location.lng
            );

            // Speed in km/h
            const speed = (distDiff / timeDiff) * 60;

            console.log(`DEBUG: Dist: ${distDiff}, Time: ${timeDiff}m, Speed: ${speed} km/h`);

            // If Speed > 100km/h (Impossible)
            if (Math.abs(speed) > 100 && distDiff > 1) { // Ignore small GPS drifts
                riskScore += 100;
                reasons.push(`Speed Fraud: ${speed.toFixed(0)} km/h detected (Moved ${distDiff.toFixed(1)}km in ${timeDiff.toFixed(1)} mins)`);
            }
        }

        // Prepare result
        return {
            isFraud: riskScore >= 50,
            riskScore,
            reasons,
        };
    },

    logFraud: async (userId, action, riskScore, reasons, metadata) => {
        if (riskScore > 0) {
            await FraudLog.create({
                user: userId,
                action,
                riskScoreAdded: riskScore,
                reason: reasons.join(', '),
                metadata
            });

            // Update User's cumulative risk (Optional, simple counter for now)
            // await User.findByIdAndUpdate(userId, { $inc: { riskScore: riskScore } });
        }
    }
};

module.exports = fraudEngine;
