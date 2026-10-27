const Admin = require('../models/Admin');
const User = require('../models/User');
const GoldPrice = require('../models/GoldPrice');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const Settings = require('../models/Settings');
const Jeweller = require('../models/Jeweller');
const UserStore = require('../models/UserStore');
const { admin } = require('../config/firebase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const generateAdminToken = (id) => {
  return jwt.sign(
    { id, isAdmin: true },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// Admin Login
const adminLogin = async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    let adminDoc = await Admin.findOne({ email: email.trim().toLowerCase() });

    const passwordMatches = adminDoc
      ? await bcrypt.compare(password, adminDoc.password)
      : false;

    const jeweller = adminDoc && adminDoc.jewellerId
      ? await Jeweller.findOne({ _id: adminDoc.jewellerId, status: 'ACTIVE' })
      : null;

    if (!adminDoc || adminDoc.status !== 'ACTIVE' || !passwordMatches || !jeweller) {
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
          jewellerId: adminDoc.jewellerId,
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
    const [customerStats] = await UserStore.aggregate([
      { $match: { jewellerId: req.jewellerId } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'ACTIVE'] },
                    { $eq: ['$user.status', 'ACTIVE'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);
    const totalUsers = customerStats ? customerStats.totalUsers : 0;
    const activeUsers = customerStats ? customerStats.activeUsers : 0;
    const totalTransactions = await Transaction.countDocuments({ jewellerId: req.jewellerId });

    const buyVolume = await Transaction.aggregate([
      { $match: { jewellerId: req.jewellerId, type: 'BUY_GOLD', status: 'SUCCESS' } },
      { $group: { _id: null, totalGrams: { $sum: '$goldGrams' }, totalRevenue: { $sum: '$amount' } } }
    ]);

    const latestPrice = await GoldPrice.findOne({ jewellerId: req.jewellerId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalTransactions,
        goldSoldGrams: buyVolume[0] ? buyVolume[0].totalGrams : 0,
        totalRevenue: buyVolume[0] ? buyVolume[0].totalRevenue : 0,
        currentGoldPrice: latestPrice || { buyPrice: 0, sellPrice: 0, gstRate: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Gold Price
const updateGoldPrice = async (req, res) => {
  const { buyPrice, sellPrice, gstRate } = req.body || {};
  const isNumericValue = (value) => typeof value === 'number' || (typeof value === 'string' && value.trim().length > 0);
  const numericBuyPrice = Number(buyPrice);
  const numericSellPrice = Number(sellPrice);
  const numericGstRate = gstRate === undefined ? 3 : Number(gstRate);
  if (!isNumericValue(buyPrice) || !Number.isFinite(numericBuyPrice) || numericBuyPrice <= 0 ||
    !isNumericValue(sellPrice) || !Number.isFinite(numericSellPrice) || numericSellPrice <= 0 ||
    (gstRate !== undefined && (!isNumericValue(gstRate) || !Number.isFinite(numericGstRate) || numericGstRate < 0))) {
    return res.status(400).json({ success: false, message: 'Buy and sell prices must be positive numbers and GST must be a non-negative number' });
  }
  try {
    const newPrice = await GoldPrice.create({
      buyPrice: numericBuyPrice,
      sellPrice: numericSellPrice,
      gstRate: numericGstRate,
      jewellerId: req.jewellerId,
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
    let themeSetting = await Settings.findOne({ key: 'app_theme', jewellerId: req.jewellerId });
    const themeVal = {
      primaryColor: primaryColor || '#0D234A',
      secondaryColor: secondaryColor || '#FFD700',
      backgroundColor: backgroundColor || '#F3F6FA',
      appName: appName || 'DigiGold',
      supportWhatsapp: supportWhatsapp || '919876543210',
      bannerText: bannerText || 'Rates are exclusive of 3% GST'
    };

    if (!themeSetting) {
      themeSetting = await Settings.create({
        key: 'app_theme',
        jewellerId: req.jewellerId,
        value: themeVal,
        description: 'Dynamic App Theme & Branding',
      });
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
    if (userId && !await UserStore.exists({
      userId,
      jewellerId: req.jewellerId,
      status: 'ACTIVE',
    })) {
      return res.status(404).json({ success: false, message: 'User is not registered with this store' });
    }
    const notif = await Notification.create({
      jewellerId: req.jewellerId,
      userId: userId || null,
      title,
      message,
      category: category || 'PROMO',
    });
    res.status(200).json({ success: true, message: 'Notification broadcasted', data: notif });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const memberships = await UserStore.find({ jewellerId: req.jewellerId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name mobile email status kycStatus');
    const users = memberships
      .filter((membership) => membership.userId)
      .map((membership) => ({
        ...membership.userId.toObject(),
        storeStatus: membership.status,
      }));
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Store customer listing error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateStoreCustomerStatus = async (req, res) => {
  const { status } = req.body || {};
  if (!['ACTIVE', 'INACTIVE'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status must be ACTIVE or INACTIVE',
    });
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid customer ID' });
  }

  try {
    const user = await User.exists({ _id: req.params.id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const membership = await UserStore.findOneAndUpdate(
      { userId: req.params.id, jewellerId: req.jewellerId },
      { $set: { status } },
      { new: true, runValidators: true },
    );
    if (!membership) {
      return res.status(404).json({ success: false, message: 'Customer is not registered with this store' });
    }

    return res.status(200).json({
      success: true,
      message: `Customer ${status === 'ACTIVE' ? 'activated' : 'deactivated'} for this store`,
      data: {
        userId: membership.userId,
        jewellerId: membership.jewellerId,
        status: membership.status,
      },
    });
  } catch (error) {
    console.error('Store customer status update error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  adminLogin,
  getDashboardStats,
  updateGoldPrice,
  updateAppThemeSettings,
  broadcastNotification,
  getAllUsers,
  updateStoreCustomerStatus,
};
