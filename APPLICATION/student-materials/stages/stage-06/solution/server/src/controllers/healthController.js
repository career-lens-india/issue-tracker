const dbConfig = require('../config/db');
const { sendSuccess } = require('../utils/errors');

function getHealth(req, res) {
  const db = dbConfig.getConnectionState();
  const payload = {
    service: 'ok',
    database: db.ready ? 'connected' : 'disconnected',
    ready: db.ready,
  };

  if (!db.ready) {
    return res.status(503).json({
      success: false,
      data: payload,
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'MongoDB is not connected',
        details: [],
      },
    });
  }

  sendSuccess(res, payload);
}

module.exports = { getHealth };
