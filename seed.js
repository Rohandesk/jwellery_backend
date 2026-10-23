require('dotenv').config();
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); } catch (e) {}
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Wallet = require('./models/Wallet');
const Transaction = require('./models/Transaction');
const GoldPrice = require('./models/GoldPrice');
const Notification = require('./models/Notification');
const Admin = require('./models/Admin');
const Carousel = require('./models/Carousel');
const Jeweller = require('./models/Jeweller');
const Branch = require('./models/Branch');
const Staff = require('./models/Staff');
const UserStore = require('./models/UserStore');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_CREDENTIALS;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is required');
    }
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB database...');

    // Clear existing collections
    await User.deleteMany({});
    await UserStore.deleteMany({});
    await Wallet.deleteMany({});
    await Transaction.deleteMany({});
    await GoldPrice.deleteMany({});
    await Notification.deleteMany({});
    await Admin.deleteMany({});
    await Carousel.deleteMany({});
    await Branch.deleteMany({});
    await Staff.deleteMany({});
    await Jeweller.deleteMany({});

    console.log('[Seed] Cleared old data.');

    const jeweller = await Jeweller.create({
      businessName: 'DigiGold Demo Store',
      slug: 'digigold-demo-store',
      gstin: '27ABCDE1234F1Z5',
      ownerName: 'DigiGold Demo',
      contactEmail: 'store@digigold.com',
      contactMobile: '9000000000',
      status: 'ACTIVE',
    });

    // 1. Seed Admin
    const admin = await Admin.create({
      email: 'admin@digigold.com',
      password: await bcrypt.hash('admin123', 12),
      firstname: 'DigiGold',
      lastname: 'Admin',
      mobile: 9000000001,
      role: 'Admin',
      jewellerId: jeweller._id,
      status: 'ACTIVE',
    });
    console.log('✓ Admin account created: admin@digigold.com / admin123');

    // 2. Seed Gold Price
    const goldPrice = await GoldPrice.create({
      buyPrice: 7250,
      sellPrice: 7030,
      gstRate: 3,
      jewellerId: jeweller._id,
      updatedBy: admin._id
    });
    console.log('✓ Initial Gold Price set: Buy ₹7,250/g, Sell ₹7,030/g');

    // 3. Seed Sample User & Wallet
    const user = await User.create({
      firebaseUid: 'mock_uid_9876543210',
      name: 'Rohit Jambhale',
      mobile: '9876543210',
      email: 'rohit@example.com',
      kycStatus: 'APPROVED',
      jewellerIds: [jeweller._id],
      panNumber: 'ABCDE1234F',
      aadhaarNumber: '123456789012'
    });
    await UserStore.create({ userId: user._id, jewellerId: jeweller._id });

    const wallet = await Wallet.create({
      userId: user._id,
      jewellerId: jeweller._id,
      cashBalance: 15400.50,
      goldGramBalance: 2.5000
    });
    console.log(`✓ Sample User created: ${user.name} (Mobile: ${user.mobile})`);

    // 4. Seed Sample Transactions
    await Transaction.create([
      {
        userId: user._id,
        jewellerId: jeweller._id,
        txnReference: 'BUY1720000001',
        type: 'BUY_GOLD',
        amount: 5000,
        goldGrams: 0.6696,
        ratePerGram: 7250,
        gstAmount: 145.63,
        paymentMode: 'WALLET',
        status: 'SUCCESS'
      },
      {
        userId: user._id,
        jewellerId: jeweller._id,
        txnReference: 'DEP1720000002',
        type: 'WALLET_DEPOSIT',
        amount: 20000,
        paymentMode: 'GATEWAY',
        status: 'SUCCESS'
      },
      {
        userId: user._id,
        jewellerId: jeweller._id,
        txnReference: 'SELL1720000003',
        type: 'SELL_GOLD',
        amount: 3515,
        goldGrams: 0.5000,
        ratePerGram: 7030,
        paymentMode: 'WALLET',
        status: 'SUCCESS'
      }
    ]);
    console.log('✓ Sample transactions created.');

    // 5. Seed Notifications
    await Notification.create([
      {
        jewellerId: jeweller._id,
        userId: user._id,
        title: '🎉 Welcome to DigiGold!',
        message: 'Start investing in 24K pure gold with as low as ₹10.',
        category: 'SYSTEM'
      },
      {
        jewellerId: jeweller._id,
        userId: null, // Broadcast
        title: '🚀 Festive Offer!',
        message: 'Get 1% extra gold bonus on purchases above ₹10,000.',
        category: 'PROMO'
      }
    ]);
    console.log('✓ Sample notifications seeded.');

    // 6. Seed Multi-Position Carousels (jewellery-platform logic)
    await Carousel.create([
      {
        jewellerId: jeweller._id,
        name: 'Invest in 24K Pure Digital Gold',
        position: 'Home Top',
        type: 'Horizontal',
        layoutStyle: 'Without Container (Full-Width)',
        dimensions: '1920 x 1080',
        aspectRatio: '16:9',
        image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=1200&auto=format&fit=crop',
        status: true,
      },
      {
        jewellerId: jeweller._id,
        name: 'Akshaya Tritiya Gold Cashback Bonanza',
        position: 'Home Top',
        type: 'Horizontal',
        layoutStyle: 'With Container (Boxed)',
        dimensions: '1200 x 675',
        aspectRatio: '16:9',
        image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&auto=format&fit=crop',
        status: true,
      },
      {
        jewellerId: jeweller._id,
        name: 'Daily Gold Saver Micro-Savings Plan',
        position: 'Home Middle',
        type: 'Vertical',
        layoutStyle: 'With Container (Sidebar/Card)',
        dimensions: '400 x 600',
        aspectRatio: '2:3',
        image: 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=1200&auto=format&fit=crop',
        status: true,
      },
      {
        jewellerId: jeweller._id,
        name: '100% Insured Doorstep Physical Gold Delivery',
        position: 'Home Bottom',
        type: 'Horizontal',
        layoutStyle: 'Without Container (Full-Width)',
        dimensions: '1920 x 1080',
        aspectRatio: '16:9',
        image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&auto=format&fit=crop',
        status: true,
      },
      {
        jewellerId: jeweller._id,
        name: 'Automate Wealth with Monthly Gold SIP',
        position: 'SIP Main',
        type: 'Horizontal',
        layoutStyle: 'Without Container (Full-Width)',
        dimensions: '1920 x 1080',
        aspectRatio: '16:9',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop',
        status: true,
      },
    ]);
    console.log('✓ Multi-position Carousels seeded (Home Top, Home Middle, Home Bottom, SIP Main).');

    console.log('\n[Seed Success] All database collections populated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
