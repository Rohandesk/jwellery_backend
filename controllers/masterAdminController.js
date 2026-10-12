const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const MasterAdmin = require('../models/MasterAdmin');

const jwtSecret = () =>
  process.env.JWT_SECRET || 'digigold_secret_jwt_key_2026_production';

const createToken = (masterAdminId) =>
  jwt.sign(
    { id: masterAdminId, isMasterAdmin: true },
    jwtSecret(),
    { expiresIn: process.env.MASTER_ADMIN_JWT_EXPIRES_IN || '1d' },
  );

const publicMasterAdmin = (masterAdmin) => ({
  id: masterAdmin._id,
  email: masterAdmin.email,
  firstname: masterAdmin.firstname,
  lastname: masterAdmin.lastname,
  mobile: masterAdmin.mobile,
  role: masterAdmin.role,
  status: masterAdmin.status,
});

const publicAdmin = (admin) => ({
  id: admin._id,
  email: admin.email,
  firstname: admin.firstname,
  lastname: admin.lastname,
  role: admin.role,
  mobile: admin.mobile,
  status: admin.status,
});

const registerMasterAdmin = async (req, res) => {
  try {
    const { email, password, firstname, lastname, mobile } = req.body;
    const setupKey = process.env.MASTER_ADMIN_SETUP_KEY;

    if (process.env.NODE_ENV === 'production' && !setupKey) {
      return res.status(503).json({
        success: false,
        message: 'Master admin setup is not configured',
      });
    }

    if (setupKey && req.get('x-master-admin-setup-key') !== setupKey) {
      return res.status(403).json({
        success: false,
        message: 'Invalid master admin setup key',
      });
    }

    if (!email || !password || !firstname || !lastname || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, firstname, lastname and mobile are required',
      });
    }

    const existingMasterAdmin = await MasterAdmin.exists({});
    if (existingMasterAdmin) {
      return res.status(403).json({
        success: false,
        message: 'A master admin already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const masterAdmin = await MasterAdmin.create({
      email,
      password: passwordHash,
      firstname,
      lastname,
      mobile: String(mobile),
    });

    return res.status(201).json({
      success: true,
      message: 'Master admin registered successfully',
      data: {
        masterAdmin: publicMasterAdmin(masterAdmin),
        token: createToken(masterAdmin._id),
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Master admin email or mobile already exists',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }

    console.error('Master admin registration error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const loginMasterAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const masterAdmin = await MasterAdmin.findOne({ email }).select('+password');
    if (!masterAdmin || masterAdmin.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, message: 'Invalid master admin credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, masterAdmin.password);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid master admin credentials' });
    }

    return res.status(200).json({
      success: true,
      message: 'Master admin authenticated successfully',
      data: { masterAdmin: publicMasterAdmin(masterAdmin), token: createToken(masterAdmin._id) },
    });
  } catch (error) {
    console.error('Master admin login error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMasterAdmins = async (req, res) => {
  try {
    const masterAdmins = await MasterAdmin.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: masterAdmins.map(publicMasterAdmin),
    });
  } catch (error) {
    console.error('Master admin listing error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMasterAdmin = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid master admin ID' });
  }

  try {
    const masterAdmin = await MasterAdmin.findById(req.params.id);
    if (!masterAdmin) {
      return res.status(404).json({ success: false, message: 'Master admin not found' });
    }
    return res.status(200).json({ success: true, data: publicMasterAdmin(masterAdmin) });
  } catch (error) {
    console.error('Master admin retrieval error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateMasterAdmin = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid master admin ID' });
  }

  try {
    const masterAdmin = await MasterAdmin.findById(req.params.id);
    if (!masterAdmin) {
      return res.status(404).json({ success: false, message: 'Master admin not found' });
    }

    const { email, firstname, lastname, mobile, password } = req.body || {};
    if (![email, firstname, lastname, mobile, password].some((value) => value !== undefined)) {
      return res.status(400).json({
        success: false,
        message: 'At least one master admin field must be provided',
      });
    }
    if (email !== undefined) masterAdmin.email = email;
    if (firstname !== undefined) masterAdmin.firstname = firstname;
    if (lastname !== undefined) masterAdmin.lastname = lastname;
    if (mobile !== undefined) masterAdmin.mobile = String(mobile);
    if (password !== undefined) {
      if (!password) {
        return res.status(400).json({ success: false, message: 'Password cannot be empty' });
      }
      masterAdmin.password = await bcrypt.hash(password, 12);
    }

    const updatedMasterAdmin = await masterAdmin.save();
    return res.status(200).json({
      success: true,
      message: 'Master admin updated successfully',
      data: publicMasterAdmin(updatedMasterAdmin),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Master admin email or mobile already exists' });
    }
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Master admin update error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteMasterAdmin = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid master admin ID' });
  }

  try {
    const masterAdmin = await MasterAdmin.findByIdAndDelete(req.params.id);
    if (!masterAdmin) {
      return res.status(404).json({ success: false, message: 'Master admin not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Master admin deleted successfully',
      data: publicMasterAdmin(masterAdmin),
    });
  } catch (error) {
    console.error('Master admin deletion error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { email, password, firstname, lastname, mobile, status } = req.body || {};

    if (!email || !password || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Email, password and mobile are required',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await Admin.create({
      email,
      password: passwordHash,
      firstname,
      lastname,
      role: 'Admin',
      mobile,
      ...(status !== undefined && { status }),
    });

    return res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: publicAdmin(admin),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Admin email or mobile already exists' });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }

    console.error('Admin creation error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: admins.map(publicAdmin) });
  } catch (error) {
    console.error('Admin listing error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAdmin = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid admin ID' });
  }

  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    return res.status(200).json({ success: true, data: publicAdmin(admin) });
  } catch (error) {
    console.error('Admin retrieval error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateAdmin = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid admin ID' });
  }

  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const { email, firstname, lastname, mobile, status, password } = req.body || {};
    if (![email, firstname, lastname, mobile, status, password].some((value) => value !== undefined)) {
      return res.status(400).json({ success: false, message: 'At least one admin field must be provided' });
    }
    if (email !== undefined) admin.email = email;
    if (firstname !== undefined) admin.firstname = firstname;
    if (lastname !== undefined) admin.lastname = lastname;
    if (mobile !== undefined) admin.mobile = mobile;
    if (status !== undefined) admin.status = status;
    if (password !== undefined) {
      if (!password) {
        return res.status(400).json({ success: false, message: 'Password cannot be empty' });
      }
      admin.password = await bcrypt.hash(password, 12);
    }

    const updatedAdmin = await admin.save();
    return res.status(200).json({
      success: true,
      message: 'Admin updated successfully',
      data: publicAdmin(updatedAdmin),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Admin email or mobile already exists' });
    }
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Admin update error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAdmin = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid admin ID' });
  }

  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Admin deleted successfully',
      data: publicAdmin(admin),
    });
  } catch (error) {
    console.error('Admin deletion error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerMasterAdmin,
  loginMasterAdmin,
  getMasterAdmins,
  getMasterAdmin,
  updateMasterAdmin,
  deleteMasterAdmin,
  createAdmin,
  getAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin,
};
