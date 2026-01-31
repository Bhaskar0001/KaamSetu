const express = require('express');
const { placeBid, getJobBids, acceptBid, counterBid, respondToCounter } = require('../controllers/bidController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:jobId', protect, authorize('worker'), placeBid);
router.get('/:jobId', protect, authorize('owner', 'thekedar'), getJobBids);
router.put('/:bidId/accept', protect, authorize('owner', 'thekedar'), acceptBid);
router.put('/:bidId/counter', protect, authorize('owner', 'thekedar'), counterBid);
router.put('/:bidId/respond', protect, authorize('worker'), respondToCounter);

module.exports = router;
