class AppError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

function sendError(res, statusCode, code, message) {
  return res.status(statusCode).json({ success: false, error: { code, message } });
}

function sendSuccess(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

module.exports = { AppError, sendError, sendSuccess };
