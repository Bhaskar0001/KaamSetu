const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a site name'],
    },
    address: {
        type: String,
        required: [true, 'Please add an address'],
    },
    location: {
        lat: Number,
        lng: Number,
    },
    radius: {
        type: Number,
        default: 500, // meters
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    shift: {
        startTime: {
            type: String,
            default: '09:00',
        },
        endTime: {
            type: String,
            default: '18:00',
        }
    },
    workers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Site', siteSchema);
