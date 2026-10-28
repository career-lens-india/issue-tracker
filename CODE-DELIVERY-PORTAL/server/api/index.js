
const {
  loadEnv,
  validateProductionConfig,
} = require('../src/config/env');

const { initializeDatabase } = require('../src/config/db');
const { createApp } = require('../src/app');
const { loadManifest } = require('../src/services/manifestService');
const { seedStagesIfNeeded } = require('../src/services/releaseService');

let appPromise;

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      loadEnv();
      validateProductionConfig();
      loadManifest();

      const dbInfo = await initializeDatabase();
      await seedStagesIfNeeded();

      const trustProxy = Boolean(process.env.VERCEL || process.env.TRUST_PROXY === 'true');
      return createApp({ mongoUrl: dbInfo.mongoUri, trustProxy });
    })().catch((error) => {
      appPromise = null;
      throw error;
    });
  }

  return appPromise;
}

module.exports = async (req, res) => {
  try {
    if (!req.originalUrl && req.url) {
      req.originalUrl = req.url;
    }
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error('API initialization failed:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    const body = {
      error: 'API_INITIALIZATION_FAILED',
      message: 'The API could not be initialized.',
    };
    if (process.env.DEBUG_INIT === 'true') {
      body.detail = error.message;
    }

    return res.status(500).json(body);
  }
};
