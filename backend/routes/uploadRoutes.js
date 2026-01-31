const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const path = require('path');

// @desc    Upload file
// @route   POST /api/upload
// @access  Public (protected in app logic)
router.post('/', upload.single('image'), (req, res) => {
    if (req.file) {
        res.send({
            message: 'Image uploaded successfully',
            filePath: `/${req.file.path.replace(/\\/g, '/')}`,
        });
    } else {
        res.status(400).send({ message: 'No file uploaded' });
    }
});

module.exports = router;
