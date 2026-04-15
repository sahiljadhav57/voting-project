// In-memory OTP storage (use Redis in production)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP with expiry
const storeOTP = (aadhaar, otp) => {
    const expiryTime = Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 5) * 60 * 1000;

    otpStore.set(aadhaar, {
        otp,
        expiryTime
    });

    // Auto-cleanup after expiry
    setTimeout(() => {
        otpStore.delete(aadhaar);
    }, (parseInt(process.env.OTP_EXPIRY_MINUTES) || 5) * 60 * 1000);
};

// Verify OTP
const verifyOTP = (aadhaar, otp) => {
    const stored = otpStore.get(aadhaar);

    if (!stored) {
        return { valid: false, message: 'OTP not found or expired' };
    }

    if (Date.now() > stored.expiryTime) {
        otpStore.delete(aadhaar);
        return { valid: false, message: 'OTP expired' };
    }

    if (stored.otp !== otp) {
        return { valid: false, message: 'Invalid OTP' };
    }

    // OTP is valid, remove it
    otpStore.delete(aadhaar);
    return { valid: true };
};

// Get stored OTP (for development/testing only)
const getStoredOTP = (aadhaar) => {
    const stored = otpStore.get(aadhaar);
    return stored ? stored.otp : null;
};

module.exports = {
    generateOTP,
    storeOTP,
    verifyOTP,
    getStoredOTP
};
