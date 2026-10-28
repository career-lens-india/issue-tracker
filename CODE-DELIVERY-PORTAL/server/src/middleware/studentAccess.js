const { sendError } = require('../utils/errors');
const { isWorkshopAuthenticated } = require('../utils/portalToken');

function isStudentAccessConfigured() {
  return Boolean((process.env.STUDENT_ACCESS_PASSWORD || '').trim());
}

function hasStudentAccess(req) {
  return isWorkshopAuthenticated(req);
}

function requireStudentAccess(req, res, next) {
  if (!isStudentAccessConfigured()) {
    return sendError(
      res,
      503,
      'STUDENT_GATE_NOT_CONFIGURED',
      'Student access password is not configured on the server'
    );
  }
  if (hasStudentAccess(req)) {
    return next();
  }
  return sendError(res, 401, 'STUDENT_ACCESS_REQUIRED', 'Workshop password required');
}

module.exports = {
  isStudentAccessConfigured,
  hasStudentAccess,
  requireStudentAccess,
};
