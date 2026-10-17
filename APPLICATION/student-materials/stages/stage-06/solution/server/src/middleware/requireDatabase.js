const dbConfig = require('../config/db');
const { sendError } = require('../utils/errors');

function requireDatabase(req, res, next) {
  const db = dbConfig.getConnectionState();
  if (!db.ready) {
    return sendError(
      res,
      503,
      'DATABASE_UNAVAILABLE',
      'Database is not connected. API requests cannot be processed.'
    );
  }
  next();
}

module.exports = requireDatabase;
