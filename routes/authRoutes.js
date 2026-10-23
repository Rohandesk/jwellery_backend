const express = require('express');
const router = express.Router();
const { verifyOtp, refreshToken } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/verify-otp', verifyOtp);
router.post('/refresh-token', protect, refreshToken);

module.exports = router;
