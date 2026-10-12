const express = require('express');
const router = express.Router();
const { getTransactions, getTransactionById } = require('../controllers/transactionController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getTransactions);
router.get('/:id', protect, getTransactionById);

module.exports = router;
