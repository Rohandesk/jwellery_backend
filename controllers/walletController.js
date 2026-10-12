const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

const generateTxnRef = (prefix = 'WLT') => {
  return `${prefix}${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
};

// @desc    Get Wallet Balance
// @route   GET /api/v1/wallet/balance
// @access  Private
const getWalletBalance = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ userId: req.user._id, cashBalance: 0, goldGramBalance: 0 });
    }
    res.status(200).json({ success: true, data: wallet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Deposit Money into Wallet
// @route   POST /api/v1/wallet/deposit
// @access  Private
const depositCash = async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Valid deposit amount is required' });
  }

  try {
    const depositAmt = Number(amount);
    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ userId: req.user._id, cashBalance: 0, goldGramBalance: 0 });
    }

    wallet.cashBalance = Number((wallet.cashBalance + depositAmt).toFixed(2));
    await wallet.save();

    const txn = await Transaction.create({
      userId: req.user._id,
      txnReference: generateTxnRef('DEP'),
      type: 'WALLET_DEPOSIT',
      amount: depositAmt,
      paymentMode: 'GATEWAY',
      status: 'SUCCESS'
    });

    res.status(200).json({
      success: true,
      message: `₹${depositAmt} deposited into wallet successfully.`,
      data: { wallet, transaction: txn }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Withdraw Cash to Bank Account
// @route   POST /api/v1/wallet/withdraw
// @access  Private
const withdrawCash = async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Valid withdrawal amount is required' });
  }

  try {
    const withdrawAmt = Number(amount);
    let wallet = await Wallet.findOne({ userId: req.user._id });

    if (!wallet || wallet.cashBalance < withdrawAmt) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient cash balance. Available: ₹${wallet ? wallet.cashBalance : 0}` 
      });
    }

    wallet.cashBalance = Number((wallet.cashBalance - withdrawAmt).toFixed(2));
    await wallet.save();

    const txn = await Transaction.create({
      userId: req.user._id,
      txnReference: generateTxnRef('WDR'),
      type: 'WALLET_WITHDRAWAL',
      amount: withdrawAmt,
      paymentMode: 'BANK_TRANSFER',
      status: 'PENDING'
    });

    res.status(200).json({
      success: true,
      message: `Withdrawal request of ₹${withdrawAmt} initiated. Cash will be credited to bank within 24 hours.`,
      data: { wallet, transaction: txn }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getWalletBalance, depositCash, withdrawCash };
