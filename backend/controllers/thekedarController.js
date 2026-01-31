const User = require('../models/User');

// @desc    Add a worker to Thekedar's pool by mobile
// @route   POST /api/thekedar/add-worker
// @access  Private (Thekedar only)
exports.addWorker = async (req, res) => {
    try {
        const { mobile } = req.body;

        if (!mobile) {
            return res.status(400).json({ success: false, message: 'Please provide worker mobile number' });
        }

        // Find worker
        const worker = await User.findOne({ mobile, role: 'worker' });
        if (!worker) {
            return res.status(404).json({ success: false, message: 'Worker not found with this mobile number' });
        }

        // Add to Thekedar's list
        const thekedar = await User.findById(req.user.id);

        // Check if already in pool
        if (thekedar.myWorkers.includes(worker._id)) {
            return res.status(400).json({ success: false, message: 'Worker already in your team' });
        }

        thekedar.myWorkers.push(worker._id);
        await thekedar.save();

        res.status(200).json({ success: true, data: worker, message: 'Worker added to team' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get Thekedar's workers
// @route   GET /api/thekedar/workers
// @access  Private (Thekedar only)
exports.getMyWorkers = async (req, res) => {
    try {
        const thekedar = await User.findById(req.user.id).populate('myWorkers');
        res.status(200).json({ success: true, data: thekedar.myWorkers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
