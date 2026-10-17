const mongoose = require('mongoose');

let isConnected = false;

function getConnectionState() {
  return {
    ready: mongoose.connection.readyState === 1,
    state: mongoose.connection.readyState,
  };
}

async function connectDatabase(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  mongoose.connection.on('connected', () => {
    isConnected = true;
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('[db] MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[db] MongoDB connection error:', err.message);
  });

  await mongoose.connect(uri);
  isConnected = true;
  console.log('[db] Connected to MongoDB');
}

async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
  getConnectionState,
};
