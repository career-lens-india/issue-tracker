const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { sendSuccess, sendError } = require('../utils/errors');
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
  const plain = (process.env.STUDENT_ACCESS_PASSWORD || '').trim();
  if (!plain || password == null) return false;
  const submitted = String(password).trim();
  return bcrypt.compareSync(submitted, bcrypt.hashSync(plain, 10));
}

router.get('/session', (req, res) => {
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
  return sendSuccess(res, { authenticated: true });
});

router.post('/logout', (req, res) => {
  req.session.studentAccess = false;
  return sendSuccess(res, { authenticated: false });
});

module.exports = router;
