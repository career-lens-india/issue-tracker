const { STATUSES, PRIORITIES } = require('../models/Issue');
const { ROLES } = require('../models/User');

const ISSUE_STATUS_GQL = {
  Open: 'OPEN',
  'In Progress': 'IN_PROGRESS',
  Closed: 'CLOSED',
};

const ISSUE_STATUS_DB = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  CLOSED: 'Closed',
};

const ISSUE_PRIORITY_GQL = {
  Low: 'LOW',
  Medium: 'MEDIUM',
  High: 'HIGH',
};

const ISSUE_PRIORITY_DB = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

const USER_ROLE_GQL = {
  Developer: 'DEVELOPER',
  Tester: 'TESTER',
  Designer: 'DESIGNER',
  'Project Manager': 'PROJECT_MANAGER',
};

const USER_ROLE_DB = {
  DEVELOPER: 'Developer',
  TESTER: 'Tester',
  DESIGNER: 'Designer',
  PROJECT_MANAGER: 'Project Manager',
};

function toGraphQLIssueStatus(dbValue) {
  return ISSUE_STATUS_GQL[dbValue];
}

function fromGraphQLIssueStatus(gqlValue) {
  const db = ISSUE_STATUS_DB[gqlValue];
  if (!db || !STATUSES.includes(db)) {
    return null;
  }
  return db;
}

function toGraphQLIssuePriority(dbValue) {
  return ISSUE_PRIORITY_GQL[dbValue];
}

function fromGraphQLIssuePriority(gqlValue) {
  const db = ISSUE_PRIORITY_DB[gqlValue];
  if (!db || !PRIORITIES.includes(db)) {
    return null;
  }
  return db;
}

function toGraphQLUserRole(dbValue) {
  return USER_ROLE_GQL[dbValue];
}

function fromGraphQLUserRole(gqlValue) {
  const db = USER_ROLE_DB[gqlValue];
  if (!db || !ROLES.includes(db)) {
    return null;
  }
  return db;
}

module.exports = {
  toGraphQLIssueStatus,
  fromGraphQLIssueStatus,
  toGraphQLIssuePriority,
  fromGraphQLIssuePriority,
  toGraphQLUserRole,
  fromGraphQLUserRole,
};
