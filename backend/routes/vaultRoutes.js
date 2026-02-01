const express = require('express');
const multer = require('multer');
const { uploadSecure, streamSecure } = require('../controllers/vaultController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Memory storage for encryption before save
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect); // All vault access requires login

router.post('/upload', upload.single('file'), uploadSecure);
router.get('/:filename', authorize('admin', 'owner', 'thekedar'), streamSecure);
// Only privileged roles can view vault items

module.exports = router;
