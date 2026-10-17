const mongoose = require('mongoose');
const { AppError, sendError } = require('../utils/errors');

function errorHandler(err, req, res, _next) {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 400, 'INVALID_JSON', 'Invalid JSON payload');
  }

  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.code, err.message, err.details);
  }

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, 400, 'VALIDATION_ERROR', 'Validation failed', details);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return sendError(
      res,
      409,
      'DUPLICATE_KEY',
      `A record with this ${field} already exists`
    );
  }

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return sendError(res, 400, 'INVALID_ID', 'Invalid resource ID format');
  }

  console.error('[error]', err.message);
  return sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
}

function notFoundHandler(req, res) {
  return sendError(res, 404, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`);
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
