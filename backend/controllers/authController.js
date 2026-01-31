const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate access token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Generate refresh token
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE,
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, mobile, pin, role } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ mobile });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            mobile,
            pin,
            role,
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { mobile, pin } = req.body;

        // Validate email & password
        if (!mobile || !pin) {
            return res.status(400).json({ success: false, message: 'Please provide mobile and PIN' });
        }

        // Check for user
        const user = await User.findOne({ mobile }).select('+pin');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if pin matches
        const isMatch = await user.matchPin(pin);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            skills: req.body.skills,
            location: req.body.location,
            experience: req.body.experience,
            companyName: req.body.companyName,
            faceData: req.body.faceData,
            profileImage: req.body.profileImage,
        };

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Verify User Identity (Aadhaar Mock)
// @route   POST /api/auth/verify-identity
// @access  Private
exports.verifyIdentity = async (req, res) => {
    try {
        const { aadhaarNumber } = req.body;

        if (!aadhaarNumber || aadhaarNumber.length !== 12) {
            return res.status(400).json({ success: false, message: 'Invalid Aadhaar Number (Must be 12 digits)' });
        }

        // Mock Verification Logic
        // In real app, this would call Digilocker/UIDAI API
        if (aadhaarNumber.startsWith('9999')) {
            return res.status(400).json({ success: false, message: 'Verification Failed: Details mismatch' });
        }

        const user = await User.findByIdAndUpdate(req.user.id, {
            aadhaarNumber,
            kycStatus: 'verified',
            isVerified: true
        }, { new: true });

        res.status(200).json({ success: true, message: 'Identity Verified Successfully', data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// Helper to send token response
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        // .cookie('token', token, options) // Optional: Use cookies if preferred
        .json({
            success: true,
            token,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                mobile: user.mobile,
                role: user.role,
            },
        });
};
