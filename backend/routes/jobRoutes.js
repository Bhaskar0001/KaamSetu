const express = require('express');
const { createJob, getMyJobs, getJobFeed, searchJobs } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('owner', 'thekedar'), createJob);
router.get('/my-jobs', protect, getMyJobs);
router.get('/feed', protect, getJobFeed);
router.get('/search', protect, searchJobs);

module.exports = router;
