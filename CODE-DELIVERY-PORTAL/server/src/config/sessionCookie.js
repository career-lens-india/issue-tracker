function parseAllowedOrigins() {
  const set = new Set();
  const primary = (process.env.CLIENT_ORIGIN || '').trim();
  if (primary) set.add(primary);
  const extra = (process.env.ALLOWED_ORIGINS || '').split(',');
  extra.forEach((o) => {
    const t = o.trim();
    if (t) set.add(t);
  });
  return set;
}

function isLocalOrigin(origin) {
  return (
    !origin ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1')
  );
}

/** Split frontend/API (e.g. two Vercel projects) needs SameSite=None. */
function usesCrossSiteSessionCookie(clientOrigin) {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd || process.env.SERVE_CLIENT === 'true') return false;
  return !isLocalOrigin(clientOrigin);
}

function getSessionCookieOptions(clientOrigin) {
  const crossSite = usesCrossSiteSessionCookie(clientOrigin);
  return {
    httpOnly: true,
    sameSite: crossSite ? 'none' : 'lax',
    secure: crossSite || process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 8 * 60 * 60 * 1000,
  };
}

function isOriginAllowed(origin) {
  if (!origin) return true;
  const allowed = parseAllowedOrigins();
  if (allowed.size === 0) {
    return isLocalOrigin(origin);
  }
  return allowed.has(origin);
}

module.exports = {
  parseAllowedOrigins,
  getSessionCookieOptions,
  isOriginAllowed,
  usesCrossSiteSessionCookie,
};
