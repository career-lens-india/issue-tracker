const mongoose = require('mongoose');
const { sendError } = require('../utils/errors');

function validateObjectId(paramName = 'id') {
  return (req, res, next) => {
    const value = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return sendError(res, 400, 'INVALID_ID', `Invalid ${paramName} format`);
    }
    next();
  };
}

module.exports = validateObjectId;
