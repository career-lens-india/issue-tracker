const { sendSuccess } = require('../utils/errors');
function getHealth(req, res) {
  sendSuccess(res, { service: 'ok', database: 'not_configured', ready: false });
}
module.exports = { getHealth };
