const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

const createMasterAdmin = async (req, res) => {
  try {
    const { email, password, firstname, lastname, role, mobile } = req.body;

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
      firstname: firstname,
      lastname: lastname,
      role: role ,
      mobile,
    });

    return res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        id: admin._id,
        email: admin.email,
        firstname: admin.firstname,
        lastname: admin.lastname,
        role: admin.role,
        mobile: admin.mobile,
      },
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

module.exports = { registerMasterAdmin, loginMasterAdmin, createMasterAdmin };
