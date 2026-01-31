const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    checkInTime: {
        type: Date,
    },
    checkOutTime: {
        type: Date,
    },
    checkInLocation: {
        lat: Number,
        lng: Number,
    },
    location: {
        lat: Number,
        lng: Number,
        address: String
    },
    selfieUrl: String,
    status: {
        type: String,
        enum: ['present', 'absent', 'half-day'],
        default: 'present',
    },
    verificationMethod: {
        type: String,
        enum: ['manual', 'face_geo', 'voice', 'offline_sync'],
        default: 'manual'
    },
    isSynced: {
        type: Boolean,
        default: true, // If coming from online API directly
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Attendance', attendanceSchema);
