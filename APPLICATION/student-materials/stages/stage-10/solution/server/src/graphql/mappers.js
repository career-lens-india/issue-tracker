const {
  toGraphQLIssueStatus,
  toGraphQLIssuePriority,
  toGraphQLUserRole,
} = require('./enums');

function mapUserToGraphQL(user) {
  if (!user) return null;
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    department: user.department || '',
    role: toGraphQLUserRole(user.role),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function mapIssueToGraphQL(issue) {
  const assigneeDoc =
    issue.assignee && typeof issue.assignee === 'object' && issue.assignee._id
      ? issue.assignee
      : null;

  return {
    id: issue._id.toString(),
    title: issue.title,
    description: issue.description,
    status: toGraphQLIssueStatus(issue.status),
    priority: toGraphQLIssuePriority(issue.priority),
    assignee: assigneeDoc ? mapUserToGraphQL(assigneeDoc) : null,
    assigneeRef: issue.assignee,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
  };
}

module.exports = {
  mapUserToGraphQL,
  mapIssueToGraphQL,
};
