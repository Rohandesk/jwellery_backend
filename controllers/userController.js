const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Settings = require('../models/Settings');

// @desc    Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    const wallet = await Wallet.findOne({ userId: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        user,
        wallet: {
          cashBalance: wallet ? wallet.cashBalance : 0,
          goldGramBalance: wallet ? wallet.goldGramBalance : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, fcmToken } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;
    if (fcmToken) user.fcmToken = fcmToken;

    await user.save();
    res.status(200).json({ success: true, message: 'Profile updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const submitKyc = async (req, res) => {
  try {
    const { panNumber, aadhaarNumber } = req.body;
    if (!panNumber || !aadhaarNumber) {
      return res.status(400).json({ success: false, message: 'PAN and Aadhaar numbers are required' });
    }

    const user = await User.findById(req.user._id);
    user.panNumber = panNumber.toUpperCase();
    user.aadhaarNumber = aadhaarNumber;
    user.kycStatus = 'PENDING';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'KYC submitted successfully. Verification pending.',
      data: { kycStatus: user.kycStatus }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Dynamic App Theme & Global Settings (with Text Color)
const getAppThemeSettings = async (req, res) => {
  try {
    let themeSetting = await Settings.findOne({ key: 'app_theme' });
    if (!themeSetting) {
      themeSetting = {
        value: {
          primaryColor: '#0D234A',
          secondaryColor: '#FFD700',
          backgroundColor: '#F3F6FA',
          textColor: '#000000',
          appName: 'DigiGold',
          supportWhatsapp: '919876543210',
          bannerText: 'Rates are exclusive of 3% GST'
        }
      };
    }
    res.status(200).json({ success: true, data: themeSetting.value });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProfile, updateProfile, submitKyc, getAppThemeSettings };
