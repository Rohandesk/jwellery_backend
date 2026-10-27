const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const MasterAdmin = require('../models/MasterAdmin');
const Jeweller = require('../models/Jeweller');
const mongoose = require('mongoose');

const protectAdmin = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.isMasterAdmin) {
        const masterAdmin = await MasterAdmin.findById(decoded.id);
        if (!masterAdmin || masterAdmin.status !== 'ACTIVE') {
          return res.status(401).json({ success: false, message: 'Master admin session invalid' });
        }

        const jewellerId = req.get('x-jeweller-id');
        if (!jewellerId || !mongoose.isValidObjectId(jewellerId)) {
          return res.status(400).json({
            success: false,
            message: 'A valid x-jeweller-id header is required for master-admin store actions',
          });
        }
        const jeweller = await Jeweller.findById(jewellerId);
        if (!jeweller) {
          return res.status(404).json({ success: false, message: 'Jeweller store not found' });
        }

        req.masterAdmin = masterAdmin;
        req.jeweller = jeweller;
        req.jewellerId = jeweller._id;
        return next();
      }

      if (!decoded.isAdmin) {
        return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required' });
      }

      req.admin = await Admin.findById(decoded.id).select('-password');
      if (!req.admin) {
        return res.status(401).json({ success: false, message: 'Admin session invalid' });
      }
      if (req.admin.status !== 'ACTIVE') {
        return res.status(403).json({ success: false, message: 'Active admin status required' });
      }
      if (!req.admin.jewellerId) {
        return res.status(403).json({ success: false, message: 'Admin is not assigned to a jeweller store' });
      }
      const jeweller = await Jeweller.findOne({ _id: req.admin.jewellerId, status: 'ACTIVE' });
      if (!jeweller) {
        return res.status(403).json({ success: false, message: 'Assigned jeweller store is not active' });
      }
      req.jeweller = jeweller;
      req.jewellerId = jeweller._id;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Admin authorization failed' });
    }
  }

  return res.status(401).json({ success: false, message: 'Admin token missing' });
};

const convertPasswordToHash = async(password) => {
    let bcryptPassword = await bcrypt.hash(password , 10);
    return bcryptPassword;
}

module.exports = { protectAdmin , convertPasswordToHash };
