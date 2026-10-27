const jwt = require('jsonwebtoken');
const MasterAdmin = require('../models/MasterAdmin');

const protectMasterAdmin = async (req, res, next) => {
  const authorization = req.headers.authorization || '';

  if (!authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Master admin token missing',
    });
  }

  try {
    const token = authorization.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
    );

    if (!decoded.isMasterAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Master admin privileges required',
      });
    }

    const masterAdmin = await MasterAdmin.findById(decoded.id);
    if (!masterAdmin || masterAdmin.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'Master admin session is invalid',
      });
    }

    req.masterAdmin = masterAdmin;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Master admin authorization failed',
    });
  }
};

const protectOwnMasterAdmin = (req, res, next) => {
  if (String(req.masterAdmin._id) !== req.params.id) {
    return res.status(403).json({
      success: false,
      message: 'Master admins can only manage their own account',
    });
  }
  return next();
};

module.exports = { protectMasterAdmin, protectOwnMasterAdmin };
