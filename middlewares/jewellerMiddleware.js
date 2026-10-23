const mongoose = require('mongoose');
const Jeweller = require('../models/Jeweller');
const UserStore = require('../models/UserStore');

const requireActiveJeweller = async (req, res, next) => {
  const jewellerId = req.get('x-jeweller-id');
  if (!jewellerId || !mongoose.isValidObjectId(jewellerId)) {
    return res.status(400).json({
      success: false,
      message: 'A valid x-jeweller-id header is required',
    });
  }

  try {
    const jeweller = await Jeweller.findOne({ _id: jewellerId, status: 'ACTIVE' });
    if (!jeweller) {
      return res.status(404).json({
        success: false,
        message: 'Active jeweller store not found',
      });
    }

    req.jeweller = jeweller;
    req.jewellerId = jeweller._id;
    if (req.user) {
      const userStore = await UserStore.findOneAndUpdate(
        { userId: req.user._id, jewellerId: jeweller._id },
        { $setOnInsert: { status: 'ACTIVE' } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
      if (userStore.status !== 'ACTIVE') {
        return res.status(403).json({
          success: false,
          message: 'Your account is inactive for this store',
        });
      }
      req.userStore = userStore;
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { requireActiveJeweller };
