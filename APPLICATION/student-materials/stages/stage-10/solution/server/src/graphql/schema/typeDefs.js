const typeDefs = `
  scalar DateTime

  enum IssueStatus {
    OPEN
    IN_PROGRESS
    CLOSED
  }

  enum IssuePriority {
    LOW
    MEDIUM
    HIGH
  }

  enum UserRole {
    DEVELOPER
    TESTER
    DESIGNER
    PROJECT_MANAGER
  }

  type User {
    id: ID!
    name: String!
    email: String!
    department: String
    role: UserRole!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Issue {
    id: ID!
    title: String!
    description: String!
    status: IssueStatus!
    priority: IssuePriority!
    assignee: User
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input IssueFiltersInput {
    search: String
    status: IssueStatus
    priority: IssuePriority
    assigneeId: ID
  }

  input CreateIssueInput {
    title: String!
    description: String!
    status: IssueStatus
    priority: IssuePriority
    assigneeId: ID
  }

  type Query {
    issues(filters: IssueFiltersInput): [Issue!]!
    issue(id: ID!): Issue
    users(search: String): [User!]!
  }

  type Mutation {
    createIssue(input: CreateIssueInput!): Issue!
  }
`;

module.exports = typeDefs;
