const Job = require('../models/Job');
const User = require('../models/User');
const matchingEngine = require('../utils/matchingEngine');

// @desc    Get Recommended Jobs for Worker
// @route   GET /api/matches/worker
// @access  Private (Worker)
exports.getWorkerMatches = async (req, res) => {
    try {
        const worker = await User.findById(req.user.id);
        const jobs = await Job.find({ status: 'open' }); // Find all open jobs

        // Calculate scores
        const scoredJobs = jobs.map(job => {
            const score = matchingEngine.calculateScore(job, worker);
            return { job, score };
        });

        // Filter and Sort
        scoredJobs.sort((a, b) => b.score - a.score);

        res.status(200).json({ success: true, data: scoredJobs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
