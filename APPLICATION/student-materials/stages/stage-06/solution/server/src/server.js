require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
require('dotenv').config();

const createApp = require('./app');
const { connectDatabase, disconnectDatabase } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set. Copy .env.example to .env and configure MongoDB.');
    process.exit(1);
  }

  try {
    await connectDatabase(uri);
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
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
        await disconnectDatabase();
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
