const express = require('express');
const { syncData } = require('../controllers/syncController');
const { protect } = require('../middleware/authMiddleware');
const { evaluateDeviceTrust } = require('../middleware/deviceTrust');

const router = express.Router();

router.use(protect);
router.use(evaluateDeviceTrust); // V5 Trust Layer

router.post('/sync', syncData);

module.exports = router;
