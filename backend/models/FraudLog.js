const mongoose = require('mongoose');

const fraudLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String,
        enum: ['check_in', 'bid', 'payout'],
        required: true,
    },
    riskScoreAdded: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
    },
    metadata: {
        type: Object,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('FraudLog', fraudLogSchema);
