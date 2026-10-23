const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, submitKyc, getAppThemeSettings } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { requireActiveJeweller } = require('../middlewares/jewellerMiddleware');

router.get('/profile', protect, requireActiveJeweller, getProfile);
router.put('/profile', protect, requireActiveJeweller, updateProfile);
router.post('/kyc', protect, requireActiveJeweller, submitKyc);
router.get('/settings', requireActiveJeweller, getAppThemeSettings);

module.exports = router;
