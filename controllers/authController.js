const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { admin } = require('../config/firebase');

const generateToken = (id, isAdmin = false) => {
  return jwt.sign(
    { id, isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const normalizePhoneNumber = (phoneNumber) => String(phoneNumber).replace(/\D/g, '');

// @desc    Verify Firebase OTP Token & Return JWT Session Token
// @route   POST /api/v1/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  const { firebaseToken, mobile, name } = req.body || {};

  if (!mobile || !normalizePhoneNumber(mobile)) {
    return res.status(400).json({ success: false, message: 'Mobile number is required' });
  }

  try {
    if (!firebaseToken) {
      return res.status(401).json({
        success: false,
        message: 'A valid Firebase sign-in token is required',
      });
    }

    if (admin.apps.length === 0) {
      return res.status(503).json({
        success: false,
        message: 'Firebase authentication is not configured',
      });
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid Firebase sign-in token' });
    }

    if (!decodedToken.phone_number ||
      normalizePhoneNumber(decodedToken.phone_number) !== normalizePhoneNumber(mobile)) {
      return res.status(401).json({
        success: false,
        message: 'The verified Firebase phone number does not match the submitted mobile number',
      });
    }
    const firebaseUid = decodedToken.uid;
    const verifiedMobile = decodedToken.phone_number;

    let user = await User.findOne({ firebaseUid });
    if (user && normalizePhoneNumber(user.mobile) !== normalizePhoneNumber(verifiedMobile)) {
      return res.status(409).json({
        success: false,
        message: 'This Firebase account is registered with a different mobile number',
      });
    }

    if (!user) {
      const existingMobile = await User.findOne({ mobile: verifiedMobile });
      if (existingMobile) {
        return res.status(409).json({
          success: false,
          message: 'This mobile number is already linked to another account',
        });
      }

      user = await User.create({
        firebaseUid,
        mobile: verifiedMobile,
        name: name || `Gold Investor ${verifiedMobile.slice(-4)}`
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'Customer account is suspended' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'OTP verified & logged in successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
          kycStatus: user.kycStatus,
        }
      }
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Refresh the authenticated customer's session token
// @route   POST /api/v1/auth/refresh-token
// @access  Private/Customer
const refreshToken = async (req, res) => {
  const token = generateToken(req.user._id);
  return res.status(200).json({ success: true, data: { token } });
};

module.exports = { verifyOtp, refreshToken };
