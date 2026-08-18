const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('=> Using existing database connection');
    return;
  }

  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    console.log('=> Using existing database connection (readyState)');
    return;
  }

  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) throw new Error('MONGODB_URI or MONGO_URI is not defined.');

    await mongoose.connect(uri);
    isConnected = true;
    console.log(`✅ MongoDB Connected Successfully`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    if (!process.env.VERCEL) {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

module.exports = connectDB;
