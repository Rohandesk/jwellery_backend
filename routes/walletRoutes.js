const express = require('express');
const router = express.Router();
const { getWalletBalance, depositCash, withdrawCash } = require('../controllers/walletController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/balance', protect, getWalletBalance);
router.post('/deposit', protect, depositCash);
router.post('/withdraw', protect, withdrawCash);

module.exports = router;
