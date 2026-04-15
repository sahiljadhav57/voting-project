const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { generateOTP, storeOTP, verifyOTP, getStoredOTP } = require('../utils/otp');

// @route   POST /api/auth/request-otp
// @desc    Request OTP for Aadhaar authentication
// @access  Public
router.post('/request-otp', async (req, res) => {
    try {
        const { aadhaar } = req.body;

        // Validate Aadhaar (12 digits)
        if (!aadhaar || aadhaar.length !== 12) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 12-digit Aadhaar number'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        storeOTP(aadhaar, otp);

        // In production, send OTP via SMS
        // For development, return OTP in response
        console.log(`📱 OTP for ${aadhaar}: ${otp}`);

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and login/register user
// @access  Public
router.post('/verify-otp', async (req, res) => {
    try {
        const { aadhaar, otp, region } = req.body;

        // Verify OTP
        const otpVerification = verifyOTP(aadhaar, otp);

        if (!otpVerification.valid) {
            return res.status(400).json({
                success: false,
                message: otpVerification.message
            });
        }

        // Validate region data
        if (!region || !region.state || !region.district || !region.constituency) {
            return res.status(400).json({
                success: false,
                message: 'Please provide complete region information'
            });
        }

        // Check if user exists
        let user = await User.findOne({ username: aadhaar });

        if (!user) {
            // Create new user
            user = await User.create({
                username: aadhaar,
                password: 'aadhaar_auth', // Placeholder password
                role: 'user',
                region
            });
        } else {
            // Update region if provided
            user.region = region;
            await user.save();
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                region: user.region,
                hasVoted: Object.fromEntries(user.hasVoted)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/auth/admin-login
// @desc    Admin login with username/password
// @access  Public
router.post('/admin-login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username and password'
            });
        }

        // Find user with password field
        const user = await User.findOne({ username }).select('+password');

        if (!user || user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                hasVoted: Object.fromEntries(user.hasVoted)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
const { protect } = require('../middleware/auth');

router.get('/me', protect, async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                username: req.user.username,
                role: req.user.role,
                region: req.user.region,
                hasVoted: Object.fromEntries(req.user.hasVoted)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
