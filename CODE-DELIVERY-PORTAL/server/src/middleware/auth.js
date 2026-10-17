const { sendError } = require('../utils/errors');

function requireAdmin(req, res, next) {
  if (req.session && req.session.admin === true) {
    return next();
  }
  return sendError(res, 401, 'UNAUTHORIZED', 'Admin authentication required');
}

module.exports = { requireAdmin };
