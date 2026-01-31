// seed_demo.js - Create Demo Users for Testing
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const { Wallet } = require('./models/Wallet');

const DEMO_USERS = [
    { name: 'Demo Worker', mobile: 'DEMO_WORKER', pin: '1234', role: 'worker', skills: ['Mason', 'Painter'] },
    { name: 'Demo Owner', mobile: 'DEMO_OWNER', pin: '1234', role: 'owner', companyName: 'Demo Construction Ltd' },
    { name: 'Demo Thekedar', mobile: 'DEMO_THEKEDAR', pin: '1234', role: 'thekedar' },
    { name: 'Demo Admin', mobile: 'DEMO_ADMIN', pin: '1234', role: 'admin' },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB Connected.');

        for (const u of DEMO_USERS) {
            // Delete existing user first to reset password
            await User.deleteOne({ mobile: u.mobile });
            console.log(`Deleted old user: ${u.mobile} (if exists)`);

            // Create user (Model's pre-save hook will hash the PIN automatically)
            const user = await User.create(u);
            console.log(`Created: ${user.mobile} (${user.role})`);

            // Create Wallet
            const walletExists = await Wallet.findOne({ user: user._id });
            if (!walletExists) {
                await Wallet.create({ user: user._id, balance: u.role === 'owner' ? 10000 : 0 });
            }
        }

        console.log('\n✅ Demo users seeded successfully!');
        console.log('\nCredentials:');
        console.log('  Worker: DEMO_WORKER / 1234');
        console.log('  Owner:  DEMO_OWNER / 1234');
        console.log('  Admin:  DEMO_ADMIN / 1234');
        process.exit(0);
    } catch (err) {
        console.error('Seed Error:', err.message);
        process.exit(1);
    }
}

seed();
