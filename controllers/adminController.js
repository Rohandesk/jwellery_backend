const Admin = require('../models/Admin');
const User = require('../models/User');
const GoldPrice = require('../models/GoldPrice');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const Settings = require('../models/Settings');
const { admin } = require('../config/firebase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateAdminToken = (id) => {
  return jwt.sign(
    { id, isAdmin: true },
    process.env.JWT_SECRET || 'digigold_secret_jwt_key_2026_production',
    { expiresIn: '1d' }
  );
};

// Admin Login
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    let adminDoc = await Admin.findOne({ email });

    const passwordMatches = adminDoc
      ? await bcrypt.compare(password, adminDoc.password)
      : false;

    if (!adminDoc || adminDoc.status !== 'ACTIVE' || !passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid admin email or password' });
    }

    const token = generateAdminToken(adminDoc._id);
    res.status(200).json({
      success: true,
      message: 'Admin authenticated successfully',
      data: {
        token,
        admin: {
          id: adminDoc._id,
          firstname: adminDoc.firstname,
          lastname: adminDoc.lastname,
          email: adminDoc.email,
          role: adminDoc.role,
          mobile: adminDoc.mobile,
          status: adminDoc.status
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'ACTIVE' });
    const totalTransactions = await Transaction.countDocuments();

    const buyVolume = await Transaction.aggregate([
      { $match: { type: 'BUY_GOLD', status: 'SUCCESS' } },
      { $group: { _id: null, totalGrams: { $sum: '$goldGrams' }, totalRevenue: { $sum: '$amount' } } }
    ]);

    const latestPrice = await GoldPrice.findOne().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalTransactions,
        goldSoldGrams: buyVolume[0] ? buyVolume[0].totalGrams : 0,
        totalRevenue: buyVolume[0] ? buyVolume[0].totalRevenue : 0,
        currentGoldPrice: latestPrice || { buyPrice: 7250, sellPrice: 7030, gstRate: 3 }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Gold Price
const updateGoldPrice = async (req, res) => {
  const { buyPrice, sellPrice, gstRate } = req.body;
  if (!buyPrice || !sellPrice) {
    return res.status(400).json({ success: false, message: 'Buy and Sell prices per gram are required' });
  }

  try {
    const newPrice = await GoldPrice.create({
      buyPrice: Number(buyPrice),
      sellPrice: Number(sellPrice),
      gstRate: gstRate ? Number(gstRate) : 3,
      ...(req.admin
        ? { updatedBy: req.admin._id }
        : { updatedByMasterAdmin: req.masterAdmin._id }),
    });
    res.status(200).json({ success: true, message: 'Gold price updated successfully', data: newPrice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update App Theme & Branding from Admin Dashboard
// @route POST /api/v1/admin/theme-settings
const updateAppThemeSettings = async (req, res) => {
  const { primaryColor, secondaryColor, backgroundColor, appName, supportWhatsapp, bannerText } = req.body;

  try {
    let themeSetting = await Settings.findOne({ key: 'app_theme' });
    const themeVal = {
      primaryColor: primaryColor || '#0D234A',
      secondaryColor: secondaryColor || '#FFD700',
      backgroundColor: backgroundColor || '#F3F6FA',
      appName: appName || 'DigiGold',
      supportWhatsapp: supportWhatsapp || '919876543210',
      bannerText: bannerText || 'Rates are exclusive of 3% GST'
    };

    if (!themeSetting) {
      themeSetting = await Settings.create({ key: 'app_theme', value: themeVal, description: 'Dynamic App Theme & Branding' });
    } else {
      themeSetting.value = themeVal;
      await themeSetting.save();
    }

    res.status(200).json({
      success: true,
      message: '🎨 Mobile App Theme & Branding updated live!',
      data: themeSetting.value
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const broadcastNotification = async (req, res) => {
  const { title, message, category, userId } = req.body;
  if (!title || !message) return res.status(400).json({ success: false, message: 'Title and message required' });

  try {
    const notif = await Notification.create({ userId: userId || null, title, message, category: category || 'PROMO' });
    res.status(200).json({ success: true, message: 'Notification broadcasted', data: notif });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-__v');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  adminLogin,
  getDashboardStats,
  updateGoldPrice,
  updateAppThemeSettings,
  broadcastNotification,
  getAllUsers,
};
