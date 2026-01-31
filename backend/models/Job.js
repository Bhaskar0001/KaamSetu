const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Please add a job title'],
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    jobType: {
        type: String,
        enum: ['direct', 'bid', 'contract'],
        default: 'direct',
    },
    wage: {
        type: Number,
        required: [true, 'Please add a wage or budget'],
    },
    location: {
        address: String,
        lat: Number,
        lng: Number,
    },
    requiredSkills: {
        type: [String],
        default: [],
    },
    date: {
        type: Date,
        required: [true, 'Please add a date'],
    },
    status: {
        type: String,
        enum: ['open', 'assigned', 'completed'],
        default: 'open',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Create index for search
jobSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Job', jobSchema);
