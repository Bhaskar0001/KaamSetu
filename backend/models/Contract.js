const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    terms: {
        type: String,
        default: 'Standard Labour Contract Terms apply. Payment upon completion.',
    },
    status: {
        type: String, // draft -> active -> completed
        enum: ['draft', 'signed_worker', 'signed_owner', 'active', 'completed', 'disputed'],
        default: 'active', // For now, auto-activate on bid acceptance
    },
    pdfPath: {
        type: String,
    },
    workerSignature: {
        signedAt: Date,
        ip: String,
        status: { type: Boolean, default: false }
    },
    ownerSignature: {
        signedAt: Date,
        ip: String,
        status: { type: Boolean, default: false }
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Contract', contractSchema);
