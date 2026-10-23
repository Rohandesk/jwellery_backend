require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { initFirebase } = require('./config/firebase');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const goldRoutes = require('./routes/goldRoutes');
const walletRoutes = require('./routes/walletRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const carouselRoutes = require('./routes/carouselRoutes');
const masterAdminRoutes = require('./routes/masterAdminRoutes');
const storeRoutes = require('./routes/storeRoutes');

const app = express();

// Middlewares
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) ||
      (allowedOrigins.length === 0 && process.env.NODE_ENV !== 'production')) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS'));
  },
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Base Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/gold', goldRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/masteradmin', masterAdminRoutes);
app.use('/api/v1/stores', storeRoutes);
app.use('/api/v1/carousels', carouselRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'DigiGold API Service', 
    timestamp: new Date() 
  });
});

// Global 404 Route
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        throw new Error('Set JWT_SECRET to a random value of at least 32 characters');
      }
      if (allowedOrigins.length === 0) {
        throw new Error('Set CORS_ORIGINS to the deployed frontend origin(s)');
      }
    }

    await connectDB();
    initFirebase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[DigiGold Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    });
  } catch (error) {
    console.error('[DigiGold Server] Startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
