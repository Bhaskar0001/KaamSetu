const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
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
    amount: {
        type: Number,
        required: [true, 'Please add a bid amount'],
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'countered', 'counter_accepted'],
        default: 'pending',
    },
    counterOfferAmount: {
        type: Number, // Owner's counter offer
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Bid', bidSchema);
