const mongoose = require('mongoose');
const { resolveAppMode, usesInMemoryDatabase, requiresExternalUri } = require('./appMode');

let memoryServer = null;
let memoryServerStarting = null;
let databaseMeta = null;

function isDbReady() {
  return mongoose.connection.readyState === 1;
}

function getDatabaseMeta() {
  if (databaseMeta) {
    return { ...databaseMeta, ready: isDbReady() };
  }
  if (process.env.NODE_ENV === 'test' && isDbReady()) {
    return { appMode: 'test', storage: 'memory', ready: true };
  }
  return {
    appMode: resolveAppMode(),
    storage: 'unknown',
    ready: isDbReady(),
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

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (process.env.VERCEL && global.__portalMongoosePromise) {
    await global.__portalMongoosePromise;
    return mongoose.connection;
  }

  const connectPromise = mongoose.connect(uri);
  if (process.env.VERCEL) {
    global.__portalMongoosePromise = connectPromise;
  }
  await connectPromise;
  return mongoose.connection;
}

async function initializeDatabase() {
  const appMode = resolveAppMode();

  if (appMode === 'test') {
    if (mongoose.connection.readyState === 1) {
      databaseMeta = { appMode: 'test', storage: 'memory' };
      return { appMode: 'test', storage: 'memory', mongoUri: process.env.MONGODB_URI };
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
    // eslint-disable-next-line no-console
    console.log('[db] Using in-memory MongoDB (APP_MODE=dev). Release state resets when the process exits.');
    return { appMode: 'dev', storage: 'memory', mongoUri: uri };
  }

  if (requiresExternalUri(appMode)) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error(`MONGODB_URI is required when APP_MODE=${appMode}`);
    }
    if (mongoose.connection.readyState !== 0 && !process.env.VERCEL) {
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
  isDbReady,
  getDatabaseMeta,
};
