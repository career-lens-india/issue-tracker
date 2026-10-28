require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
require('dotenv').config();

const createApp = require('./app');
const { initializeDatabase, shutdownDatabase } = require('./config/db');
const PORT = process.env.PORT || 5000;

async function startServer() {
  let dbInfo;
  try {
    dbInfo = await initializeDatabase();
    console.log(`[db] APP_MODE=${dbInfo.appMode} storage=${dbInfo.storage}`);
  } catch (err) {
    console.error('Failed to initialize database:', err.message);
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(PORT, () => {
    console.log(`SprintBoard API listening on port ${PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down...`);
    server.close(async () => {
      try {
        await shutdownDatabase();
        process.exit(0);
      } catch (err) {
        console.error('Error during shutdown:', err.message);
        process.exit(1);
      }
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer();
