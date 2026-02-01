const express = require('express');
const { createSite, getMySites, assignWorker } = require('../controllers/siteController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('thekedar', 'owner'));

router.route('/')
    .post(createSite)
    .get(getMySites);

router.post('/:id/assign', assignWorker);

module.exports = router;
