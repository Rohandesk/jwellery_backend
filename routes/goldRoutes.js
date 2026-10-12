const express = require('express');
const router = express.Router();
const { getLivePrice, buyGold, sellGold } = require('../controllers/goldController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/live-price', getLivePrice);
router.post('/buy', protect, buyGold);
router.post('/sell', protect, sellGold);

module.exports = router;
