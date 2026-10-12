const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { admin } = require('../config/firebase');

const generateToken = (id, isAdmin = false) => {
  return jwt.sign(
    { id, isAdmin },
    process.env.JWT_SECRET || 'digigold_secret_jwt_key_2026_production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Verify Firebase OTP Token & Return JWT Session Token
// @route   POST /api/v1/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  const { firebaseToken, mobile, name } = req.body;

  if (!mobile) {
    return res.status(400).json({ success: false, message: 'Mobile number is required' });
  }

  try {
    if (process.env.NODE_ENV === 'production' && (!firebaseToken || admin.apps.length === 0)) {
      return res.status(401).json({
        success: false,
        message: 'A valid Firebase sign-in token is required',
      });
    }

    let firebaseUid = `uid_mock_${mobile}`;

    // Verify with Firebase Admin if token provided & admin initialized
    if (firebaseToken && admin.apps.length > 0) {
      const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      firebaseUid = decodedToken.uid;
    }

    let user = await User.findOne({ mobile });

    if (!user) {
      user = await User.create({
        firebaseUid,
        mobile,
        name: name || `Gold Investor ${mobile.slice(-4)}`
      });

      // Initialize Wallet for new User
      await Wallet.create({
        userId: user._id,
        cashBalance: 0,
        goldGramBalance: 0
      });
    }

    const token = generateToken(user._id);

    const wallet = await Wallet.findOne({ userId: user._id });

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
          cashBalance: wallet ? wallet.cashBalance : 0,
          goldGramBalance: wallet ? wallet.goldGramBalance : 0
        }
      }
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Refresh session token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
const refreshToken = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const token = generateToken(user._id);
    res.status(200).json({ success: true, data: { token } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { verifyOtp, refreshToken };
