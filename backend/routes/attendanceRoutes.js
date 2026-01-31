const express = require('express');
const { markAttendance, deleteAttendance, syncAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/check-in', protect, authorize('worker'), markAttendance);
router.post('/sync', protect, authorize('worker'), syncAttendance);
router.delete('/:jobId', protect, deleteAttendance);

module.exports = router;
