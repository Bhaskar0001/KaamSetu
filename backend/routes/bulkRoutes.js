const express = require('express');
const { bulkAssign, bulkAttendance } = require('../controllers/bulkController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('thekedar', 'owner')); // Only managers can do bulk ops

router.post('/sites/:siteId/assign', bulkAssign);
router.post('/attendance', bulkAttendance);

module.exports = router;
