const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function getPortalRoot() {
  return path.resolve(__dirname, '../../..');
}

function getServerRoot() {
  return path.resolve(__dirname, '../..');
}

function loadEnv() {
  const envPath = path.join(getPortalRoot(), '.env');
  const result = require('dotenv').config({ path: envPath });
  if (result.error && process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.warn(`[env] Could not load ${envPath}: ${result.error.message}`);
  }
}

function listMaterialsRootCandidates() {
  const portalRoot = getPortalRoot();
  const serverRoot = getServerRoot();
  const configured = (process.env.STUDENT_MATERIALS_PATH || '').trim();
  const candidates = [];

  if (configured) {
    candidates.push(
      path.isAbsolute(configured)
        ? configured
        : path.resolve(portalRoot, configured)
    );
  }

  // Bundled copy (Vercel / serverless — see scripts/sync-student-materials.mjs)
  candidates.push(path.join(serverRoot, 'student-materials'));

  // Monorepo: shared with APPLICATION workshop app
  candidates.push(path.resolve(portalRoot, '../APPLICATION/student-materials'));
  candidates.push(path.resolve(portalRoot, '../../APPLICATION/student-materials'));

  if (!configured) {
    candidates.push(path.resolve(portalRoot, '../APPLICATION/student-materials'));
  }

  const seen = new Set();
  return candidates.filter((p) => {
    const key = path.normalize(p);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getMaterialsRoot() {
  for (const root of listMaterialsRootCandidates()) {
    const manifestPath = path.join(root, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      return path.normalize(root);
    }
  }

  const tried = listMaterialsRootCandidates();
  throw new Error(
    `Student materials not found. Set STUDENT_MATERIALS_PATH or run: node scripts/sync-student-materials.mjs. Tried:\n${tried.map((p) => `  - ${p}`).join('\n')}`
  );
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

  getMaterialsRoot();
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
  listMaterialsRootCandidates,
  validateProductionConfig,
  getSessionSecret,
};
