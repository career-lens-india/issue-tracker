const path = require('path');
const crypto = require('crypto');

function loadEnv() {
  const envPath = path.join(__dirname, '../../../.env');
  const result = require('dotenv').config({ path: envPath });
  if (result.error && process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.warn(`[env] Could not load ${envPath}: ${result.error.message}`);
  }
}

function getMaterialsRoot() {
  const configured = process.env.STUDENT_MATERIALS_PATH || '../APPLICATION/student-materials';
  const resolved = path.isAbsolute(configured)
    ? configured
    : path.resolve(__dirname, '../../../', configured);
  return path.normalize(resolved);
}

function validateProductionConfig() {
  if (process.env.NODE_ENV !== 'production') return;

  const mode = (process.env.APP_MODE || 'production').trim().toLowerCase();
  if (mode === 'dev') {
    throw new Error('APP_MODE=dev is not allowed when NODE_ENV=production');
  }
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required in production');
  }

  const secret = process.env.SESSION_SECRET || '';
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters in production');
  }
  const password = process.env.ADMIN_PASSWORD || '';
  if (!password || password === 'change-me-in-production') {
    throw new Error('ADMIN_PASSWORD must be set to a strong value in production');
  }
  if (!process.env.ADMIN_USERNAME) {
    throw new Error('ADMIN_USERNAME is required in production');
  }
  if (!(process.env.STUDENT_ACCESS_PASSWORD || '').trim()) {
    throw new Error('STUDENT_ACCESS_PASSWORD is required in production');
  }
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET is required in production');
  }
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  loadEnv,
  getMaterialsRoot,
  validateProductionConfig,
  getSessionSecret,
};
