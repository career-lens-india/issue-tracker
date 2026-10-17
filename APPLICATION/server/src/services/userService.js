const User = require('../models/User');

async function listUsers({ search } = {}) {
  const filter = {};
  if (search !== undefined && search !== null && search !== '') {
    const term = String(search).trim();
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }
  return User.find(filter).sort({ createdAt: -1 });
}

module.exports = {
  listUsers,
};
