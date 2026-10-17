const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const User = require('../models/User');
const { STATUSES, PRIORITIES } = require('../models/Issue');
const { AppError } = require('../utils/errors');

const ASSIGNEE_POPULATE = { path: 'assignee', select: 'name email department role' };

async function assertValidAssignee(assigneeId) {
  if (assigneeId === undefined || assigneeId === null || assigneeId === '') {
    return null;
  }
  if (!mongoose.Types.ObjectId.isValid(assigneeId)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid assignee ID');
  }
  const user = await User.findById(assigneeId);
  if (!user) {
    throw new AppError(400, 'INVALID_ASSIGNEE', 'Assignee user does not exist');
  }
  return assigneeId;
}

function buildIssueFilter({ search, status, priority, assignee } = {}) {
  const filter = {};

  if (status !== undefined && status !== null && status !== '') {
    if (!STATUSES.includes(status)) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        `Invalid status. Allowed: ${STATUSES.join(', ')}`
      );
    }
    filter.status = status;
  }

  if (priority !== undefined && priority !== null && priority !== '') {
    if (!PRIORITIES.includes(priority)) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        `Invalid priority. Allowed: ${PRIORITIES.join(', ')}`
      );
    }
    filter.priority = priority;
  }

  if (assignee !== undefined && assignee !== null && assignee !== '') {
    if (!mongoose.Types.ObjectId.isValid(assignee)) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid assignee filter ID');
    }
    filter.assignee = assignee;
  }

  if (search !== undefined && search !== null && search !== '') {
    const term = String(search).trim();
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: regex }, { description: regex }];
  }

  return filter;
}

function validateIssueCreateInput({ title, description, status, priority }) {
  if (!title || !String(title).trim()) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Title is required');
  }
  if (!description || !String(description).trim()) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Description is required');
  }
  if (String(description).trim().length < 10) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Description must be at least 10 characters');
  }
  if (status !== undefined && status !== null && !STATUSES.includes(status)) {
    throw new AppError(400, 'VALIDATION_ERROR', `Invalid status. Allowed: ${STATUSES.join(', ')}`);
  }
  if (priority !== undefined && priority !== null && !PRIORITIES.includes(priority)) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      `Invalid priority. Allowed: ${PRIORITIES.join(', ')}`
    );
  }
}

async function listIssues(filters = {}) {
  const filter = buildIssueFilter(filters);
  return Issue.find(filter).populate(ASSIGNEE_POPULATE).sort({ createdAt: -1 });
}

async function getIssueById(id) {
  return Issue.findById(id).populate(ASSIGNEE_POPULATE);
}

async function createIssueRecord({ title, description, status, priority, assignee }) {
  validateIssueCreateInput({ title, description, status, priority });
  const assigneeId = await assertValidAssignee(assignee);

  const issue = await Issue.create({
    title: String(title).trim(),
    description: String(description).trim(),
    status,
    priority,
    assignee: assigneeId,
  });

  await issue.populate(ASSIGNEE_POPULATE);
  return issue;
}

module.exports = {
  ASSIGNEE_POPULATE,
  assertValidAssignee,
  buildIssueFilter,
  validateIssueCreateInput,
  listIssues,
  getIssueById,
  createIssueRecord,
  STATUSES,
  PRIORITIES,
};
