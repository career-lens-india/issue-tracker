const { AppError, sendError } = require('../utils/errors');

function errorHandler(err, req, res, _next) {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 400, 'INVALID_JSON', 'Invalid JSON payload');
  }

  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.code, err.message, err.details);
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
