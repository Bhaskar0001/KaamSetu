const express = require('express');
const { getWageEstimate } = require('../controllers/payrollController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/calculate', getWageEstimate);

module.exports = router;
