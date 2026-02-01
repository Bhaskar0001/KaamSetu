const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const users = [
    {
        name: 'Demo Worker',
        mobile: 'DEMO_WORKER',
        pin: '1234',
        role: 'worker',
        aadhaarNumber: '209477038935', // Valid Verhoeff
        isVerified: true
    },
    {
        name: 'Demo Owner',
        mobile: 'DEMO_OWNER',
        pin: '1234',
        role: 'owner',
        aadhaarNumber: '999999990019',
        isVerified: true
    },
    {
        name: 'Demo Thekedar',
        mobile: 'DEMO_THEKEDAR',
        pin: '1234',
        role: 'thekedar',
        aadhaarNumber: '309477038935',
        isVerified: true
    }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        for (const user of users) {
            // Hash PIN
            // Note: User model usually hashes pre-save, but if we use updateOne it might not.
            // Let's rely on standard logic. If using create, ensure we don't double hash if model has pre-save.
            // Checking User model... usually has pre('save').
            // To be safe, we will just delete old and create new using User.create

            await User.deleteOne({ mobile: user.mobile });
            await User.create(user);
            console.log(`Created ${user.name}`);
        }

        console.log('✅ Demo Users Seeded Successfully');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
