const express = require('express');
const router = express.Router();
const { getLivePrice, buyGold, sellGold } = require('../controllers/goldController');
const { protect } = require('../middlewares/authMiddleware');
const { requireActiveJeweller } = require('../middlewares/jewellerMiddleware');

router.get('/live-price', requireActiveJeweller, getLivePrice);
router.post('/buy', protect, requireActiveJeweller, buyGold);
router.post('/sell', protect, requireActiveJeweller, sellGold);

module.exports = router;
