const express = require('express');
const { getStats, getPendingVerifications, verifyUser, getFraudLogs } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // All routes require Admin role

router.get('/stats', getStats);
router.get('/verifications', getPendingVerifications);
router.post('/verify/:userId', verifyUser);
router.get('/fraud-logs', getFraudLogs);

module.exports = router;
