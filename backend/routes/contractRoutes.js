const express = require('express');
const { getContract } = require('../controllers/contractController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:id', protect, getContract);

module.exports = router;
