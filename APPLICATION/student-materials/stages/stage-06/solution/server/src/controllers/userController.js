const User = require('../models/User');
const userService = require('../services/userService');
const { AppError, sendSuccess } = require('../utils/errors');

async function listUsers(req, res, next) {
  try {
    const users = await userService.listUsers({ search: req.query.search });
    sendSuccess(res, users);
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email, department, role } = req.body;

    if (!name || !String(name).trim()) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Name is required');
    }
    if (!email || !String(email).trim()) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Email is required');
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      throw new AppError(409, 'DUPLICATE_EMAIL', 'A user with this email already exists');
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      department: department ? String(department).trim() : '',
      role,
    });

    sendSuccess(res, user, 201);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listUsers,
  createUser,
};
