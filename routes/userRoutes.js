const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, submitKyc, getAppThemeSettings } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/kyc', protect, submitKyc);
router.get('/settings', getAppThemeSettings);

module.exports = router;
