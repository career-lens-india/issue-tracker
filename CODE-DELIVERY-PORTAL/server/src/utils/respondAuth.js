const { sendSuccess } = require('./errors');

/**
 * Finish a login response after best-effort session save.
 * Cross-origin deploys rely on the signed token in JSON + Authorization header, not cookies.
 */
function respondAuth(req, res, data) {
  if (!req.session) {
    return sendSuccess(res, data);
  }
  req.session.save((err) => {
    if (err && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[auth] session save failed (Bearer token still valid):', err.message);
    }
    return sendSuccess(res, data);
  });
}

module.exports = { respondAuth };
