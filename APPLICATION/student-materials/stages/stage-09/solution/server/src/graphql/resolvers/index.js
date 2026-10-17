const mongoose = require('mongoose');
const { GraphQLError } = require('graphql');
const User = require('../../models/User');
const issueService = require('../../services/issueService');
const userService = require('../../services/userService');
const { AppError } = require('../../utils/errors');
const DateTimeType = require('../scalars/DateTime');
const {
  fromGraphQLIssueStatus,
  fromGraphQLIssuePriority,
} = require('../enums');
const { mapIssueToGraphQL, mapUserToGraphQL } = require('../mappers');
const { toGraphQLError } = require('../errors');

function buildFiltersInput(filters) {
  if (!filters) return {};
  const status = filters.status ? fromGraphQLIssueStatus(filters.status) : undefined;
  if (filters.status && !status) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid status filter');
  }
  const priority = filters.priority ? fromGraphQLIssuePriority(filters.priority) : undefined;
  if (filters.priority && !priority) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid priority filter');
  }
  if (filters.assigneeId && !mongoose.Types.ObjectId.isValid(filters.assigneeId)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid assignee filter ID');
  }
  return {
    search: filters.search,
    status,
    priority,
    assignee: filters.assigneeId,
  };
}

async function resolveIssueById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'INVALID_ID', 'Invalid issue ID format');
  }
  const issue = await issueService.getIssueById(id);
  if (!issue) {
    throw new AppError(404, 'NOT_FOUND', 'Issue not found');
  }
  return mapIssueToGraphQL(issue);
}

const resolvers = {
  DateTime: DateTimeType,

  Query: {
    async issues(_parent, { filters }) {
      try {
        const dbFilters = buildFiltersInput(filters);
        const issues = await issueService.listIssues(dbFilters);
        return issues.map(mapIssueToGraphQL);
      } catch (err) {
        throw toGraphQLError(err);
      }
    },

    async issue(_parent, { id }) {
      try {
        return await resolveIssueById(id);
      } catch (err) {
        throw toGraphQLError(err);
      }
    },

    async users(_parent, { search }) {
      try {
        const users = await userService.listUsers({ search });
        return users.map(mapUserToGraphQL);
      } catch (err) {
        throw toGraphQLError(err);
      }
    },
  },

  Issue: {
    async assignee(parent) {
      if (parent.assignee) {
        return parent.assignee;
      }
      const ref = parent.assigneeRef;
      if (!ref) return null;
      const userId = typeof ref === 'object' && ref._id ? ref._id : ref;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return null;
      }
      const user = await User.findById(userId);
      return user ? mapUserToGraphQL(user) : null;
    },
  },
};

module.exports = resolvers;
