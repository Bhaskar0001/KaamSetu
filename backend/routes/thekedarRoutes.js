const express = require('express');
const { addWorker, getMyWorkers } = require('../controllers/thekedarController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('thekedar'));

router.post('/add-worker', addWorker);
router.get('/workers', getMyWorkers);

module.exports = router;
