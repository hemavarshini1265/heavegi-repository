const mongoose = require('mongoose');

let isConnected = false;

async function connectMongo() {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/heavegi';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Do not hang if Mongo is unreachable
      connectTimeoutMS: 3000,
    });
    isConnected = true;
    console.log('🍃 [MongoDB] Successfully connected to:', uri);
  } catch (err) {
    console.warn(`🍃 [MongoDB] Connection skipped or unavailable (${err.message}). Using in-memory fallback store.`);
  }
}

function getMongoStatus() {
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  return states[mongoose.connection.readyState] || 'disconnected';
}

module.exports = { connectMongo, getMongoStatus };
