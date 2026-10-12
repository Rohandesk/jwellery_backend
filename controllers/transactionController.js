const Transaction = require('../models/Transaction');

// @desc    Get user's transactions with filtering & pagination
// @route   GET /api/v1/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { type, status, limit = 20, page = 1 } = req.query;

    const filter = { userId: req.user._id };
    if (type) filter.type = type;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Transaction Detail / Invoice
// @route   GET /api/v1/transactions/:id
// @access  Private
const getTransactionById = async (req, res) => {
  try {
    const txn = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!txn) {
      return res.status(404).json({ success: false, message: 'Transaction record not found' });
    }
    res.status(200).json({ success: true, data: txn });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTransactions, getTransactionById };
