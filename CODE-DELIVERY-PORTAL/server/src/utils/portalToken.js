const crypto = require('crypto');
const { getSessionSecret } = require('../config/env');

const MAX_AGE_MS = 8 * 60 * 60 * 1000;

function signPortalToken(role) {
  if (role !== 'admin' && role !== 'workshop') {
    throw new Error(`Invalid portal token role: ${role}`);
  }
  const secret = getSessionSecret();
  const payload = {
    role,
    exp: Date.now() + MAX_AGE_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyPortalToken(token, expectedRole) {
  if (!token || typeof token !== 'string') return false;
  token = token.trim();
  const secret = getSessionSecret();
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return false;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expectedSig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  if (sig.length !== expectedSig.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (typeof payload.exp !== 'number') return false;
    if (Date.now() > payload.exp) return false;
    if (payload.role !== expectedRole && !(expectedRole === 'admin' && payload.admin === true)) {
      return false;
    }
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

/** Read query params when Express query parser misses them (Vercel serverless). */
function readQueryParam(req, name) {
  const fromExpress = req.query?.[name];
  if (fromExpress != null && String(fromExpress).trim()) {
    return String(fromExpress).trim();
  }
  const raw = req.originalUrl || req.url || '';
  const idx = raw.indexOf('?');
  if (idx === -1) return null;
  const value = new URLSearchParams(raw.slice(idx + 1)).get(name);
  return value && value.trim() ? value.trim() : null;
}

function extractRequestToken(req) {
  const bearer = parseBearer(req);
  if (bearer) return bearer;
  const headerToken = req.headers['x-portal-token'] || req.headers['x-admin-token'];
  if (typeof headerToken === 'string' && headerToken.trim()) return headerToken.trim();
  const bodyToken = req.body?.token;
  if (typeof bodyToken === 'string' && bodyToken.trim()) return bodyToken.trim();
  return (
    readQueryParam(req, 'token') ||
    readQueryParam(req, 'portalToken') ||
    readQueryParam(req, 'adminToken') ||
    readQueryParam(req, 'workshopToken') ||
    null
  );
}

function signAdminToken() {
  return signPortalToken('admin');
}

function signWorkshopToken() {
  return signPortalToken('workshop');
}

function isAdminAuthenticated(req) {
  const token = extractRequestToken(req);
  if (verifyPortalToken(token, 'admin')) return true;
  if (req.session?.admin) return true;
  return false;
}

function isWorkshopAuthenticated(req) {
  const token = extractRequestToken(req);
  if (verifyPortalToken(token, 'workshop')) return true;
  if (verifyPortalToken(token, 'admin')) return true;
  if (req.session?.studentAccess) return true;
  if (req.session?.admin) return true;
  return false;
}

module.exports = {
  signPortalToken,
  verifyPortalToken,
  signAdminToken,
  signWorkshopToken,
  extractRequestToken,
  isAdminAuthenticated,
  isWorkshopAuthenticated,
};
