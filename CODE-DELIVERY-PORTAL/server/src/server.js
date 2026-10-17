const { loadEnv, validateProductionConfig, getMaterialsRoot } = require('./config/env');
const { initializeDatabase, shutdownDatabase, isDbReady } = require('./config/db');
const { createApp } = require('./app');
const { loadManifest } = require('./services/manifestService');
const { seedStagesIfNeeded } = require('./services/releaseService');

loadEnv();
validateProductionConfig();

const port = Number(process.env.PORT || 4000);

async function start() {
  try {
    loadManifest();
    // eslint-disable-next-line no-console
    console.log(`Student materials root: ${getMaterialsRoot()}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to load manifest:', err.message);
    process.exit(1);
  }

  let dbInfo;
  try {
    dbInfo = await initializeDatabase();
    // eslint-disable-next-line no-console
    console.log(`[db] APP_MODE=${dbInfo.appMode} storage=${dbInfo.storage}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Server failed to start:', err.message);
    process.exit(1);
  }

  await seedStagesIfNeeded();

  const app = createApp({ mongoUrl: dbInfo.mongoUri });
  const server = app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Code delivery portal API listening on http://localhost:${port}`);
    // eslint-disable-next-line no-console
    console.log(`Database ready: ${isDbReady()}`);
  });

  const shutdown = async (signal) => {
    // eslint-disable-next-line no-console
    console.log(`\n${signal} received. Shutting down...`);
    server.close(async () => {
      try {
        await shutdownDatabase();
        process.exit(0);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error during shutdown:', err.message);
        process.exit(1);
      }
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
