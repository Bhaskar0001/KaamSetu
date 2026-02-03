const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getTodayScreen } = require('../controllers/engagementController');

router.get('/today', protect, getTodayScreen);

module.exports = router;
