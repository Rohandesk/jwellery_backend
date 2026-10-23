const express = require('express');
const router = express.Router();
const { getTransactions, getTransactionById } = require('../controllers/transactionController');
const { protect } = require('../middlewares/authMiddleware');
const { requireActiveJeweller } = require('../middlewares/jewellerMiddleware');

router.get('/', protect, requireActiveJeweller, getTransactions);
router.get('/:id', protect, requireActiveJeweller, getTransactionById);

module.exports = router;
