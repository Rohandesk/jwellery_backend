const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const MasterAdmin = require('../models/MasterAdmin');

const protectAdmin = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'digigold_secret_jwt_key_2026_production');

      if (decoded.isMasterAdmin) {
        const masterAdmin = await MasterAdmin.findById(decoded.id);
        if (!masterAdmin || masterAdmin.status !== 'ACTIVE') {
          return res.status(401).json({ success: false, message: 'Master admin session invalid' });
        }

        req.masterAdmin = masterAdmin;
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
