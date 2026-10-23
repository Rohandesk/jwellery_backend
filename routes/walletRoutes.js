const express = require('express');
const router = express.Router();
const { getWalletBalance, depositCash, withdrawCash } = require('../controllers/walletController');
const { protect } = require('../middlewares/authMiddleware');
const { requireActiveJeweller } = require('../middlewares/jewellerMiddleware');

router.get('/balance', protect, requireActiveJeweller, getWalletBalance);
router.post('/deposit', protect, requireActiveJeweller, depositCash);
router.post('/withdraw', protect, requireActiveJeweller, withdrawCash);

module.exports = router;
