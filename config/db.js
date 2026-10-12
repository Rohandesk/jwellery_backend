const mongoose = require('mongoose');
const dns = require('dns');

// Use reliable DNS resolvers for MongoDB Atlas SRV lookup
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (err) {
  // ignore if restricted
}

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_CREDENTIALS;

  if (!mongoUri) {
    throw new Error('Set MONGODB_URI (or MONGODB_CREDENTIALS) before starting the server');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[MongoDB Atlas] Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('[MongoDB Error] Could not connect:', error.message);
    throw error;
  }
};

module.exports = connectDB;
