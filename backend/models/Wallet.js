const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    balance: {
        type: Number,
        default: 0,
        min: [0, 'Balance cannot be negative'], // Critical Safety Check
    },
    currency: {
        type: String,
        default: 'INR',
    },
    isFrozen: {
        type: Boolean,
        default: false,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const transactionSchema = new mongoose.Schema({
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true,
    },
    type: {
        type: String,
        enum: ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER_IN', 'TRANSFER_OUT'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    relatedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
    },
    description: {
        type: String,
        required: true,
    },
    balanceAfter: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILED', 'PENDING'],
        default: 'SUCCESS',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = {
    Wallet: mongoose.model('Wallet', walletSchema),
    Transaction: mongoose.model('Transaction', transactionSchema)
};
