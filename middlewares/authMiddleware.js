const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'digigold_secret_jwt_key_2026_production');
      if (decoded.isAdmin !== false || decoded.isMasterAdmin) {
        return res.status(403).json({ success: false, message: 'Customer access token required' });
      }

      req.user = await User.findById(decoded.id).select('-__v');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found or token invalid' });
      }
      if (req.user.status !== 'ACTIVE') {
        return res.status(403).json({ success: false, message: 'Active customer account required' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token verification failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
