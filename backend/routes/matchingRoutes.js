const express = require('express');
const { getWorkerMatches } = require('../controllers/matchingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/worker', protect, authorize('worker'), getWorkerMatches);

module.exports = router;
