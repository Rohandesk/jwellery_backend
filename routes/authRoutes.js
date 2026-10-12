const express = require('express');
const router = express.Router();
const { verifyOtp, refreshToken } = require('../controllers/authController');

router.post('/verify-otp', verifyOtp);
router.post('/refresh-token', refreshToken);

module.exports = router;
