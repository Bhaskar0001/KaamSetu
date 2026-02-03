const Job = require('../models/Job');

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Owner/Thekedar)
exports.createJob = async (req, res) => {
    try {
        const { title, description, jobType, wage, location, requiredSkills, date } = req.body;

        const job = await Job.create({
            postedBy: req.user.id,
            title,
            description,
            jobType,
            wage,
            location,
            requiredSkills,
            date,
        });

        res.status(201).json({ success: true, data: job });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get jobs posted by current user
// @route   GET /api/jobs/my-jobs
// @access  Private
exports.getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user.id });
        res.status(200).json({ success: true, data: jobs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all jobs (Worker Feed)
// @route   GET /api/jobs/feed
// @access  Private
exports.getJobFeed = async (req, res) => {
    try {
        // TODO: Elasticsearch integration needed here once we hit 10k jobs. 
        // For now, simple Mongo find is "good enough".
        const jobs = await Job.find({ status: 'open' }).populate('postedBy', 'name companyName');
        res.status(200).json({ success: true, data: jobs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Search Jobs (Voice/Text)
// @route   GET /api/jobs/search?q=painter
// @access  Private
exports.searchJobs = async (req, res) => {
    try {
        const { q } = req.query;
        let query = { status: 'open' };

        if (q) {
            query.$text = { $search: q };
        }

        const jobs = await Job.find(query)
            .populate('postedBy', 'name companyName')
            .sort({ score: { $meta: 'textScore' } }); // Mongo text search is surprisingly fast

        res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
