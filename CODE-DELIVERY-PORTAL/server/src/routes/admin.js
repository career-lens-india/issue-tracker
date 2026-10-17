const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { requireAdmin } = require('../middleware/auth');
const { loadManifest } = require('../services/manifestService');
const {
  getAllReleases,
  updateStageStatus,
} = require('../services/releaseService');
const { sendSuccess, sendError } = require('../utils/errors');
const { isDbReady } = require('../config/db');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many login attempts' } },
});

function verifyAdminPassword(password) {
  const plain = (process.env.ADMIN_PASSWORD || '').trim();
  if (!plain || password == null) return false;
  const submitted = String(password).trim();
  return bcrypt.compareSync(submitted, bcrypt.hashSync(plain, 10));
}

function requireDb(req, res, next) {
  if (!isDbReady()) {
    return sendError(res, 503, 'DB_NOT_READY', 'Database is not connected');
  }
  return next();
}

router.post('/login', loginLimiter, requireDb, async (req, res) => {
  const { username, password } = req.body || {};
  const expectedUser = (process.env.ADMIN_USERNAME || 'admin').trim();
  if (!username || !password) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Username and password required');
  }
  if (String(username).trim() !== expectedUser) {
    return sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid credentials');
  }
  const match = verifyAdminPassword(password);
  if (!match) {
    return sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid credentials');
  }
  req.session.admin = true;
  return sendSuccess(res, { username: expectedUser });
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return sendError(res, 500, 'LOGOUT_FAILED', 'Could not log out');
    }
    res.clearCookie('portal.sid');
    return sendSuccess(res, { loggedOut: true });
  });
});

router.get('/session', (req, res) => {
  if (req.session && req.session.admin) {
    return sendSuccess(res, { authenticated: true, username: process.env.ADMIN_USERNAME || 'admin' });
  }
  return sendSuccess(res, { authenticated: false });
});

router.get('/stages', requireAdmin, requireDb, async (req, res, next) => {
  try {
    const manifest = loadManifest();
    const releases = await getAllReleases();
    const byId = {};
    releases.forEach((r) => {
      byId[r.stageId] = r;
    });
    const stages = manifest.stages.map((s) => ({
      id: s.id,
      order: s.order,
      title: s.title,
      status: byId[s.id]?.status || 'COMING_SOON',
      updatedAt: byId[s.id]?.updatedAt,
      lastAction: byId[s.id]?.lastAction,
    }));
    return sendSuccess(res, { stages });
  } catch (err) {
    return next(err);
  }
});

router.patch('/stages/:stageId/status', requireAdmin, requireDb, async (req, res, next) => {
  try {
    const { stageId } = req.params;
    if (!/^stage-\d{2}$/.test(stageId)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid stage id');
    }
    const { action } = req.body || {};
    await updateStageStatus(stageId, action);
    const releases = await getAllReleases();
    return sendSuccess(res, { stages: releases.map((r) => ({ stageId: r.stageId, status: r.status })) });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
