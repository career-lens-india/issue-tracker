const { sendError } = require('./errors');

/**
 * Persist session to Mongo before ending the response (required on Vercel serverless).
 */
function saveSession(req, res, next) {
  req.session.save((err) => {
    if (err) {
      return sendError(res, 500, 'SESSION_SAVE_FAILED', 'Could not persist session');
    }
    return next();
  });
}

module.exports = { saveSession };
