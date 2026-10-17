const Issue = require('../models/Issue');
const { STATUSES, PRIORITIES } = require('../models/Issue');
const { AppError, sendSuccess } = require('../utils/errors');
const issueService = require('../services/issueService');

const FORBIDDEN_UPDATE_FIELDS = ['_id', 'createdAt', 'updatedAt', '__v'];

async function listIssues(req, res, next) {
  try {
    const issues = await issueService.listIssues(req.query);
    sendSuccess(res, issues);
  } catch (err) {
    next(err);
  }
}

async function getIssue(req, res, next) {
  try {
    const issue = await issueService.getIssueById(req.params.id);
    if (!issue) {
      throw new AppError(404, 'NOT_FOUND', 'Issue not found');
    }
    sendSuccess(res, issue);
  } catch (err) {
    next(err);
  }
}

async function createIssue(req, res, next) {
  try {
    const issue = await issueService.createIssueRecord(req.body);
    sendSuccess(res, issue, 201);
  } catch (err) {
    next(err);
  }
}

async function updateIssue(req, res, next) {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      throw new AppError(404, 'NOT_FOUND', 'Issue not found');
    }

    const updates = { ...req.body };
    FORBIDDEN_UPDATE_FIELDS.forEach((field) => delete updates[field]);

    if (updates.title !== undefined) {
      if (!String(updates.title).trim()) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Title cannot be empty');
      }
      updates.title = String(updates.title).trim();
    }

    if (updates.description !== undefined) {
      if (!String(updates.description).trim()) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Description is required');
      }
      if (String(updates.description).trim().length < 10) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Description must be at least 10 characters');
      }
      updates.description = String(updates.description).trim();
    }

    if (updates.status !== undefined && !STATUSES.includes(updates.status)) {
      throw new AppError(400, 'VALIDATION_ERROR', `Invalid status. Allowed: ${STATUSES.join(', ')}`);
    }

    if (updates.priority !== undefined && !PRIORITIES.includes(updates.priority)) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        `Invalid priority. Allowed: ${PRIORITIES.join(', ')}`
      );
    }

    if ('assignee' in updates) {
      updates.assignee = await issueService.assertValidAssignee(updates.assignee);
    }

    Object.assign(issue, updates);
    await issue.save();
    await issue.populate(issueService.ASSIGNEE_POPULATE);
    sendSuccess(res, issue);
  } catch (err) {
    next(err);
  }
}

async function deleteIssue(req, res, next) {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) {
      throw new AppError(404, 'NOT_FOUND', 'Issue not found');
    }
    sendSuccess(res, { message: 'Issue deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
};
