const express = require('express');
const { getWallet, addFunds, payWorker, withdrawFunds } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/wallet', protect, getWallet);
router.post('/add-funds', protect, addFunds);
router.post('/pay-worker', protect, authorize('owner', 'thekedar'), payWorker);
router.post('/withdraw', protect, withdrawFunds);

module.exports = router;
