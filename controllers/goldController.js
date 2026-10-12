const GoldPrice = require('../models/GoldPrice');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// Helper to generate reference ID
const generateTxnRef = (prefix = 'TXN') => {
  return `${prefix}${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
};

// @desc    Get live gold buy/sell rates
// @route   GET /api/v1/gold/live-price
// @access  Public
const getLivePrice = async (req, res) => {
  try {
    let priceDoc = await GoldPrice.findOne().sort({ createdAt: -1 });

    // Fallback default market rate if database has no entries
    if (!priceDoc) {
      priceDoc = {
        buyPrice: 7250,   // ₹7,250 per gram
        sellPrice: 7030,  // ₹7,030 per gram
        gstRate: 3,       // 3% GST
        updatedAt: new Date()
      };
    }

    res.status(200).json({
      success: true,
      data: {
        buyPricePerGram: priceDoc.buyPrice,
        sellPricePerGram: priceDoc.sellPrice,
        gstPercentage: priceDoc.gstRate,
        updatedAt: priceDoc.updatedAt || priceDoc.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Buy Gold (by Amount or Grams)
// @route   POST /api/v1/gold/buy
// @access  Private
const buyGold = async (req, res) => {
  const { amount, grams, paymentMode } = req.body; // Pass amount in INR or grams

  try {
    const livePrice = await GoldPrice.findOne().sort({ createdAt: -1 });
    const buyPrice = livePrice ? livePrice.buyPrice : 7250;
    const gstRate = livePrice ? livePrice.gstRate : 3;

    let totalAmount = 0;
    let goldGrams = 0;

    if (amount && amount > 0) {
      totalAmount = Number(amount);
      const amountWithoutGst = totalAmount / (1 + gstRate / 100);
      goldGrams = Number((amountWithoutGst / buyPrice).toFixed(4));
    } else if (grams && grams > 0) {
      goldGrams = Number(grams);
      const baseCost = goldGrams * buyPrice;
      totalAmount = Number((baseCost * (1 + gstRate / 100)).toFixed(2));
    } else {
      return res.status(400).json({ success: false, message: 'Specify either amount (INR) or grams to purchase' });
    }

    const gstAmount = Number((totalAmount - (totalAmount / (1 + gstRate / 100))).toFixed(2));

    // Get User Wallet
    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ userId: req.user._id, cashBalance: 0, goldGramBalance: 0 });
    }

    const pMode = paymentMode || 'WALLET';

    if (pMode === 'WALLET') {
      if (wallet.cashBalance < totalAmount) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient wallet balance. Available: ₹${wallet.cashBalance}, Required: ₹${totalAmount}` 
        });
      }

      // Deduct cash & credit gold
      wallet.cashBalance = Number((wallet.cashBalance - totalAmount).toFixed(2));
      wallet.goldGramBalance = Number((wallet.goldGramBalance + goldGrams).toFixed(4));
      await wallet.save();
    } else {
      // Gateway simulation
      wallet.goldGramBalance = Number((wallet.goldGramBalance + goldGrams).toFixed(4));
      await wallet.save();
    }

    // Save Transaction
    const txn = await Transaction.create({
      userId: req.user._id,
      txnReference: generateTxnRef('BUY'),
      type: 'BUY_GOLD',
      amount: totalAmount,
      goldGrams,
      ratePerGram: buyPrice,
      gstAmount,
      paymentMode: pMode,
      status: 'SUCCESS'
    });

    res.status(200).json({
      success: true,
      message: `Successfully purchased ${goldGrams} grams of 24K Gold!`,
      data: {
        transaction: txn,
        updatedWallet: {
          cashBalance: wallet.cashBalance,
          goldGramBalance: wallet.goldGramBalance
        }
      }
    });

  } catch (error) {
    console.error('Buy Gold Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Sell Gold (Grams to Cash)
// @route   POST /api/v1/gold/sell
// @access  Private
const sellGold = async (req, res) => {
  const { grams } = req.body;

  if (!grams || grams <= 0) {
    return res.status(400).json({ success: false, message: 'Valid gold grams are required to sell' });
  }

  try {
    const livePrice = await GoldPrice.findOne().sort({ createdAt: -1 });
    const sellPrice = livePrice ? livePrice.sellPrice : 7030;

    const goldGramsToSell = Number(grams);
    const payoutAmount = Number((goldGramsToSell * sellPrice).toFixed(2));

    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet || wallet.goldGramBalance < goldGramsToSell) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient gold balance. Available: ${wallet ? wallet.goldGramBalance : 0}g, Requested: ${goldGramsToSell}g` 
      });
    }

    // Deduct gold & credit cash
    wallet.goldGramBalance = Number((wallet.goldGramBalance - goldGramsToSell).toFixed(4));
    wallet.cashBalance = Number((wallet.cashBalance + payoutAmount).toFixed(2));
    await wallet.save();

    // Create Transaction
    const txn = await Transaction.create({
      userId: req.user._id,
      txnReference: generateTxnRef('SELL'),
      type: 'SELL_GOLD',
      amount: payoutAmount,
      goldGrams: goldGramsToSell,
      ratePerGram: sellPrice,
      paymentMode: 'WALLET',
      status: 'SUCCESS'
    });

    res.status(200).json({
      success: true,
      message: `Successfully sold ${goldGramsToSell}g gold for ₹${payoutAmount}. Cash credited to wallet.`,
      data: {
        transaction: txn,
        updatedWallet: {
          cashBalance: wallet.cashBalance,
          goldGramBalance: wallet.goldGramBalance
        }
      }
    });

  } catch (error) {
    console.error('Sell Gold Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLivePrice, buyGold, sellGold };
