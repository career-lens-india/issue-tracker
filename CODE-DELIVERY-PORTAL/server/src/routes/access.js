const express = require('express');
const rateLimit = require('express-rate-limit');
const { sendSuccess, sendError } = require('../utils/errors');
const { signWorkshopToken } = require('../utils/portalToken');
const { verifyEnvPassword } = require('../utils/envPassword');
const { respondAuth } = require('../utils/respondAuth');
const {
  isStudentAccessConfigured,
  hasStudentAccess,
} = require('../middleware/studentAccess');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Too many attempts. Try again later.' },
  },
});

function verifyStudentPassword(password) {
  return verifyEnvPassword('STUDENT_ACCESS_PASSWORD', password);
}

router.get('/session', (req, res) => {
  res.set('Cache-Control', 'no-store');
  const required = isStudentAccessConfigured();
  return sendSuccess(res, {
    required,
    authenticated: required ? hasStudentAccess(req) : true,
  });
});

router.post('/login', loginLimiter, (req, res) => {
  if (!isStudentAccessConfigured()) {
    return sendError(
      res,
      503,
      'STUDENT_GATE_NOT_CONFIGURED',
      'Student access password is not configured on the server'
    );
  }
  const { password } = req.body || {};
  if (!password) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Password required');
  }
  if (!verifyStudentPassword(password)) {
    return sendError(res, 401, 'INVALID_CREDENTIALS', 'Incorrect workshop password');
  }
  req.session.studentAccess = true;
  const token = signWorkshopToken();
  return respondAuth(req, res, { authenticated: true, token });
});

router.post('/logout', (req, res) => {
  req.session.studentAccess = false;
  return respondAuth(req, res, { authenticated: false });
});

module.exports = router;
