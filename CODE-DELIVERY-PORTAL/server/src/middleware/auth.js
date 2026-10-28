const { sendError } = require('../utils/errors');
const { isAdminAuthenticated } = require('../utils/adminToken');

function requireAdmin(req, res, next) {
  if (isAdminAuthenticated(req)) {
    return next();
  }
  return sendError(res, 401, 'UNAUTHORIZED', 'Admin authentication required');
}

module.exports = { requireAdmin };
