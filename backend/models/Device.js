const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    deviceId: {
        type: String,
        required: true,
        // Represents a unique hash of the hardware (e.g., from FingerprintJS)
    },
    fingerprint: {
        os: String,
        browser: String,
        userAgent: String,
        ip: String,
    },
    trustScore: {
        type: Number,
        default: 100, // Starts high, reduces on suspicious activity
        min: 0,
        max: 100,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    lastSeen: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Prevent multiple active records for same user+device if needed, 
// but history is good. Ideally unique compound index.
deviceSchema.index({ user: 1, deviceId: 1 }, { unique: true });

module.exports = mongoose.model('Device', deviceSchema);
