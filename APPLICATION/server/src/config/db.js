const mongoose = require('mongoose');
const { resolveAppMode, usesInMemoryDatabase, requiresExternalUri } = require('./appMode');

let isConnected = false;
let memoryServer = null;
let memoryServerStarting = null;
let databaseMeta = null;

function getConnectionState() {
  return {
    ready: mongoose.connection.readyState === 1,
    state: mongoose.connection.readyState,
  };
}

function getDatabaseMeta() {
  if (databaseMeta) {
    return { ...databaseMeta, ready: getConnectionState().ready };
  }
  if (process.env.NODE_ENV === 'test' && getConnectionState().ready) {
    return { appMode: 'test', storage: 'memory', ready: true };
  }
  return {
    appMode: resolveAppMode(),
    storage: 'unknown',
    ready: getConnectionState().ready,
  };
}

async function startMemoryServer() {
  if (memoryServer) {
    return memoryServer.getUri();
  }
  if (!memoryServerStarting) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServerStarting = MongoMemoryServer.create().then((server) => {
      memoryServer = server;
      memoryServerStarting = null;
      return server;
    });
  }
  const server = await memoryServerStarting;
  return server.getUri();
}

async function stopMemoryServer() {
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
  memoryServerStarting = null;
}

async function connectDatabase(uri) {
  if (!uri) {
    throw new Error('MongoDB connection URI is required');
  }

  if (mongoose.connection.readyState === 0) {
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
  }
  isConnected = true;
  console.log('[db] Connected to MongoDB');
}

async function initializeDatabase() {
  const appMode = resolveAppMode();

  if (appMode === 'test') {
    if (mongoose.connection.readyState === 1) {
      databaseMeta = { appMode: 'test', storage: 'memory' };
      return { appMode, storage: 'memory', mongoUri: mongoose.connection.host };
    }
    throw new Error('APP_MODE=test expects the test harness to connect Mongoose before starting the app');
  }

  if (usesInMemoryDatabase(appMode)) {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    const uri = await startMemoryServer();
    await connectDatabase(uri);
    databaseMeta = { appMode: 'dev', storage: 'memory' };
    console.log('[db] Using in-memory MongoDB (APP_MODE=dev). Data resets when the process exits.');
    return { appMode: 'dev', storage: 'memory', mongoUri: uri };
  }

  if (requiresExternalUri(appMode)) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error(`MONGODB_URI is required when APP_MODE=${appMode}`);
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await stopMemoryServer();
    await connectDatabase(uri);
    databaseMeta = { appMode, storage: 'external' };
    return { appMode, storage: 'external', mongoUri: uri };
  }

  throw new Error(`Unhandled APP_MODE: ${appMode}`);
}

async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
}

async function shutdownDatabase() {
  await disconnectDatabase();
  await stopMemoryServer();
  databaseMeta = null;
}

module.exports = {
  connectDatabase,
  initializeDatabase,
  disconnectDatabase,
  shutdownDatabase,
  getConnectionState,
  getDatabaseMeta,
  startMemoryServer,
  stopMemoryServer,
};
