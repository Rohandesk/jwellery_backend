const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Branch = require('../models/Branch');
const Carousel = require('../models/Carousel');
const GoldPrice = require('../models/GoldPrice');
const GoldSip = require('../models/GoldSip');
const Jeweller = require('../models/Jeweller');
const Notification = require('../models/Notification');
const PaymentOrder = require('../models/PaymentOrder');
const Settings = require('../models/Settings');
const Staff = require('../models/Staff');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const UserStore = require('../models/UserStore');
const Wallet = require('../models/Wallet');

const publicJeweller = (jeweller) => ({
  id: jeweller._id,
  businessName: jeweller.businessName,
  slug: jeweller.slug,
  logoUrl: jeweller.logoUrl,
});

const getActiveJewellers = async (req, res) => {
  try {
    const jewellers = await Jeweller.find({ status: 'ACTIVE' })
      .select('businessName slug logoUrl')
      .sort({ businessName: 1 });
    return res.status(200).json({
      success: true,
      data: jewellers.map(publicJeweller),
    });
  } catch (error) {
    console.error('Active jeweller listing error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createJeweller = async (req, res) => {
  try {
    const {
      businessName,
      slug,
      gstin,
      ownerName,
      contactEmail,
      contactMobile,
      logoUrl,
      customGoldMarginPct,
      bankDetails,
      status,
    } = req.body || {};
    if (!businessName || !slug || !gstin || !ownerName || !contactEmail || !contactMobile) {
      return res.status(400).json({
        success: false,
        message: 'businessName, slug, gstin, ownerName, contactEmail and contactMobile are required',
      });
    }
    const jeweller = await Jeweller.create({
      businessName,
      slug,
      gstin,
      ownerName,
      contactEmail,
      contactMobile,
      ...(logoUrl !== undefined && { logoUrl }),
      ...(customGoldMarginPct !== undefined && { customGoldMarginPct }),
      ...(bankDetails !== undefined && { bankDetails }),
      ...(status !== undefined && { status }),
    });
    return res.status(201).json({
      success: true,
      message: 'Jeweller store created successfully',
      data: jeweller,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Store slug, GSTIN or mobile already exists' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Jeweller creation error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getJewellers = async (req, res) => {
  try {
    const jewellers = await Jeweller.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: jewellers });
  } catch (error) {
    console.error('Jeweller listing error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getJeweller = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid jeweller ID' });
  }
  try {
    const jeweller = await Jeweller.findById(req.params.id);
    if (!jeweller) {
      return res.status(404).json({ success: false, message: 'Jeweller store not found' });
    }
    return res.status(200).json({ success: true, data: jeweller });
  } catch (error) {
    console.error('Jeweller retrieval error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateJeweller = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid jeweller ID' });
  }
  try {
    const jeweller = await Jeweller.findById(req.params.id);
    if (!jeweller) {
      return res.status(404).json({ success: false, message: 'Jeweller store not found' });
    }

    const fields = [
      'businessName',
      'slug',
      'gstin',
      'ownerName',
      'contactEmail',
      'contactMobile',
      'logoUrl',
      'customGoldMarginPct',
      'bankDetails',
      'status',
    ];
    const body = req.body || {};
    const providedFields = fields.filter((field) => body[field] !== undefined);
    if (providedFields.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one store field must be provided' });
    }
    providedFields.forEach((field) => {
      jeweller[field] = body[field];
    });

    const updatedJeweller = await jeweller.save();
    return res.status(200).json({
      success: true,
      message: 'Jeweller store updated successfully',
      data: updatedJeweller,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Store slug, GSTIN or mobile already exists' });
    }
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Jeweller update error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteJeweller = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid jeweller ID' });
  }
  try {
    const jeweller = await Jeweller.findById(req.params.id);
    if (!jeweller) {
      return res.status(404).json({ success: false, message: 'Jeweller store not found' });
    }
    const linkedRecords = await Promise.all([
      Admin.exists({ jewellerId: jeweller._id }),
      Branch.exists({ jewellerId: jeweller._id }),
      Carousel.exists({ jewellerId: jeweller._id }),
      GoldPrice.exists({ jewellerId: jeweller._id }),
      GoldSip.exists({ jewellerId: jeweller._id }),
      Notification.exists({ jewellerId: jeweller._id }),
      PaymentOrder.exists({ jewellerId: jeweller._id }),
      Settings.exists({ jewellerId: jeweller._id }),
      Staff.exists({ jewellerId: jeweller._id }),
      Transaction.exists({ jewellerId: jeweller._id }),
      User.exists({ jewellerIds: jeweller._id }),
      UserStore.exists({ jewellerId: jeweller._id }),
      Wallet.exists({ jewellerId: jeweller._id }),
    ]);
    if (linkedRecords.some(Boolean)) {
      return res.status(409).json({
        success: false,
        message: 'Store has linked accounts or data. Suspend it instead of deleting it.',
      });
    }

    await jeweller.deleteOne();
    return res.status(200).json({ success: true, message: 'Jeweller store deleted successfully' });
  } catch (error) {
    console.error('Jeweller deletion error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getActiveJewellers,
  createJeweller,
  getJewellers,
  getJeweller,
  updateJeweller,
  deleteJeweller,
};
