const User = require('../models/User');
const FraudLog = require('../models/FraudLog');
const Job = require('../models/Job');

// @desc    Get Stats
// @route   GET /api/admin/stats
exports.getStats = async (req, res) => {
    try {
        const workers = await User.countDocuments({ role: 'worker' });
        const owners = await User.countDocuments({ role: 'owner' });
        const jobs = await Job.countDocuments();

        res.status(200).json({ success: true, data: { workers, owners, jobs } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get Pending Verifications
// @route   GET /api/admin/verifications
exports.getPendingVerifications = async (req, res) => {
    try {
        // Mock logic: users with 'pending' status (Need to add status to User model ideally, assuming all new users need verify)
        // For now, return recent users
        const users = await User.find().sort({ createdAt: -1 }).limit(10);
        res.status(200).json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Verify/Ban User
// @route   POST /api/admin/verify/:userId
exports.verifyUser = async (req, res) => {
    try {
        const { action } = req.body; // 'approve' or 'ban'
        const user = await User.findById(req.params.userId);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (action === 'ban') {
            // Logic to ban (add isBanned field to model ideally)
            res.status(200).json({ success: true, message: 'User Banned' });
        } else {
            res.status(200).json({ success: true, message: 'User Verified' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get Fraud Logs
// @route   GET /api/admin/fraud-logs
exports.getFraudLogs = async (req, res) => {
    try {
        const logs = await FraudLog.find({ riskScoreAdded: { $gt: 50 } }).populate('user', 'name mobile').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: logs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
