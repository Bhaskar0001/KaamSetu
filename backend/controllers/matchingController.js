const Job = require('../models/Job');
const User = require('../models/User');
const matchingEngine = require('../utils/matchingEngine');

// @desc    Get Recommended Jobs for Worker
// @route   GET /api/matches/worker
// @access  Private (Worker)
// @desc    Get Recommended Jobs for Worker (Production Geospatial Match)
// @route   GET /api/matches/worker
// @access  Private (Worker)
exports.getWorkerMatches = async (req, res) => {
    try {
        const worker = await User.findById(req.user.id);

        if (!worker.location || !worker.location.lat) {
            // Fallback if worker has no location: Show all open jobs sorted by date
            const jobs = await Job.find({ status: 'open' }).sort({ createdAt: -1 }).limit(20);
            return res.status(200).json({ success: true, warning: 'Update your location for better matches', data: jobs.map(j => ({ job: j, score: 0 })) });
        }

        // Production Real-Time Matching Pipeline
        // 1. $geoNear: Get jobs within 50km
        // 2. $match: Filter by Status = 'open'
        // 3. $addFields: simple matches

        const jobs = await Job.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [worker.location.lng, worker.location.lat] },
                    distanceField: "dist.calculated",
                    maxDistance: 50000, // 50km
                    query: { status: 'open' },
                    includeLocs: "dist.location",
                    spherical: true
                }
            },
            { $limit: 50 } // Performance cap
        ]);

        // Secondary Scoring (In-Memory for fine tuning)
        // We still use matchingEngine for the detailed Skill & Rating score
        // but now we operate on a much smaller dataset (50 items vs 10,000)

        const scoredJobs = jobs.map(job => {
            const score = matchingEngine.calculateScore(job, worker);
            // Boost score for proximity (already filtered, but prioritizing closer)
            return { job, score };
        });

        // Sort by final combined score
        scoredJobs.sort((a, b) => b.score - a.score);

        res.status(200).json({ success: true, data: scoredJobs });
    } catch (err) {
        console.error("Matching Error:", err.message);
        res.status(500).json({ success: false, message: 'Matching Service Unavailable' });
    }
};
