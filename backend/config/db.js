const mongoose = require('mongoose');

let cachedDbPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedDbPromise) {
    return cachedDbPromise;
  }

  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) throw new Error('MONGODB_URI or MONGO_URI is not defined.');

    cachedDbPromise = mongoose.connect(uri);

    await cachedDbPromise;
    console.log(`✅ MongoDB Connected Successfully`);
    return mongoose.connection;
  } catch (error) {
    cachedDbPromise = null;
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
