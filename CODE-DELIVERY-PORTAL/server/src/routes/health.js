const express = require('express');
const { isDbReady, getDatabaseMeta } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/errors');

const router = express.Router();

router.get('/', (req, res) => {
  const dbReady = isDbReady();
  const meta = getDatabaseMeta();
  const payload = {
    service: 'ok',
    database: dbReady ? 'connected' : 'disconnected',
    appMode: meta.appMode,
    storage: meta.storage,
  };
  if (!dbReady) {
    return res.status(503).json({
      success: false,
      error: { code: 'DB_NOT_READY', message: 'Database is not connected' },
      data: payload,
    });
  }
  return sendSuccess(res, payload);
});

module.exports = router;
