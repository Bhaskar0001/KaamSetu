const Site = require('../models/Site');
const User = require('../models/User');

// @desc    Create a new site
// @route   POST /api/sites
// @access  Private (Thekedar/Owner)
exports.createSite = async (req, res) => {
    try {
        const { name, address, lat, lng, radius, startTime, endTime } = req.body;

        const site = await Site.create({
            name,
            address,
            location: { lat, lng },
            radius,
            owner: req.user.id,
            shift: { startTime, endTime }
        });

        res.status(201).json({ success: true, data: site });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all sites for logged in user
// @route   GET /api/sites
// @access  Private
exports.getMySites = async (req, res) => {
    try {
        const sites = await Site.find({ owner: req.user.id }).populate('workers', 'name mobile skills profileImage');
        res.status(200).json({ success: true, data: sites });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Assign worker to site
// @route   POST /api/sites/:id/assign
// @access  Private
exports.assignWorker = async (req, res) => {
    try {
        const { workerId } = req.body;
        const site = await Site.findById(req.params.id);

        if (!site) {
            return res.status(404).json({ success: false, message: 'Site not found' });
        }

        // Check ownership
        if (site.owner.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Check if worker exists in user's pool (optional, but good for security)
        // For now, assuming if they have ID they can add.

        if (site.workers.includes(workerId)) {
            return res.status(400).json({ success: false, message: 'Worker already assigned to this site' });
        }

        site.workers.push(workerId);
        await site.save();

        res.status(200).json({ success: true, data: site });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
