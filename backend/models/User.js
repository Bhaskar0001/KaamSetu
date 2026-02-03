const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    mobile: {
        type: String,
        required: [true, 'Please add a mobile number'],
        unique: true,
    },
    role: {
        type: String,
        enum: ['worker', 'thekedar', 'owner', 'admin'],
        default: 'worker',
    },
    skills: {
        type: [String],
        default: [],
    },
    location: {
        address: String,
        lat: Number,
        lng: Number,
    },
    experience: {
        type: Number,
        default: 0,
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    ratingCount: {
        type: Number,
        default: 0,
    },
    companyName: {
        type: String,
    },
    faceData: {
        type: String, // Path to face image or embedding
    },
    pin: {
        type: String,
        required: [true, 'Please add a PIN'],
        select: false, // Don't return by default
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    aadhaarNumber: {
        type: String,
        select: false,
    },
    kycStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'none'],
        default: 'none',
    },
    profileImage: {
        type: String, // URL to object storage
        default: 'default.jpg',
    },
    // Production KYC Documents
    documents: {
        aadhaarFront: String, // URL to uploaded file
        aadhaarBack: String,
        selfie: String,
    },
    verification: {
        status: {
            type: String,
            enum: ['PENDING', 'VERIFIED', 'REJECTED', 'NONE'],
            default: 'NONE'
        },
        faceMatchScore: { type: Number, default: 0 }, // 0-100 confidence
        verifiedAt: Date
    },
    // Gamification & Engagement
    badges: [{
        type: { type: String, enum: ['TRUSTED', 'ON_TIME', 'VERIFIED_PRO'] },
        awardedAt: { type: Date, default: Date.now }
    }],
    stats: {
        streak: { type: Number, default: 0 },
        onTimePct: { type: Number, default: 100 },
        jobsCompleted: { type: Number, default: 0 }
    },
    lastActiveAt: Date,
    // Thekedar specific: Pool of workers
    myWorkers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Encrypt PIN using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('pin')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.pin = await bcrypt.hash(this.pin, salt);
});

// Match user entered PIN to hashed PIN in database
userSchema.methods.matchPin = async function (enteredPin) {
    return await bcrypt.compare(enteredPin, this.pin);
};

module.exports = mongoose.model('User', userSchema);
