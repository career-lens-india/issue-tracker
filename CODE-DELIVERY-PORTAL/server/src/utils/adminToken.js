const crypto = require('crypto');
const { getSessionSecret } = require('../config/env');

const MAX_AGE_MS = 8 * 60 * 60 * 1000;

function signAdminToken() {
  const secret = getSessionSecret();
  const payload = {
    admin: true,
    exp: Date.now() + MAX_AGE_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return false;
  const secret = getSessionSecret();
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return false;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload.admin || typeof payload.exp !== 'number') return false;
    if (Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

function parseBearer(req) {
  const header = req.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : null;
}

function isAdminAuthenticated(req) {
  if (req.session && req.session.admin) return true;
  return verifyAdminToken(parseBearer(req));
}

module.exports = {
  signAdminToken,
  verifyAdminToken,
  parseBearer,
  isAdminAuthenticated,
};
