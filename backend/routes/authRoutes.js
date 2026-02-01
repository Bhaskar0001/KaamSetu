const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const {
    register,
    login,
    getMe,
    updateProfile,
    verifyIdentity,
    sendOtp,
    verifyOtp,
    verifyAadhaarDetails,
    uploadKYC
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Register, Login, Me
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/verify-identity', protect, verifyIdentity);

// Verification Routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/verify-aadhaar-details', verifyAadhaarDetails);

// KYC Upload Route (Digital KYC)
router.post('/kyc-upload', protect, upload.fields([
    { name: 'aadhaarFront', maxCount: 1 },
    { name: 'aadhaarBack', maxCount: 1 },
    { name: 'selfie', maxCount: 1 }
]), uploadKYC);

module.exports = router;
