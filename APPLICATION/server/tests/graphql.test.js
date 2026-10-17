const request = require('supertest');
const mongoose = require('mongoose');
const createApp = require('../src/app');
const DateTimeType = require('../src/graphql/scalars/DateTime');
const { schema } = require('../src/graphql');

const app = createApp();

async function gql(query, variables) {
  const res = await request(app)
    .post('/graphql')
    .set('Content-Type', 'application/json')
    .send({ query, variables });
  return { status: res.status, body: res.body };
}

describe('GraphQL API', () => {
  test('schema initializes', () => {
    expect(schema.getQueryType()).toBeDefined();
    expect(schema.getMutationType()).toBeDefined();
  });

  test('filters issues through GraphQL variables', async () => {
    await request(app).post('/api/issues').send({
      title: 'Filter Open Issue',
      description: 'Used for GraphQL status filter test.',
      status: 'Open',
    });
    await request(app).post('/api/issues').send({
      title: 'Filter Closed Issue',
      description: 'Closed issue for GraphQL filter test.',
      status: 'Closed',
    });

    const { body } = await gql(
      `
      query ($filters: IssueFiltersInput) {
        issues(filters: $filters) {
          id
          title
          status
        }
      }
    `,
      { filters: { status: 'CLOSED' } }
    );

    expect(body.errors).toBeUndefined();
    expect(body.data.issues.every((i) => i.status === 'CLOSED')).toBe(true);
  });

  test('supports introspection in non-production', async () => {
    const { body } = await gql(`
      query {
        __schema {
          queryType { name }
          mutationType { name }
        }
      }
    `);
    expect(body.errors).toBeUndefined();
    expect(body.data.__schema.queryType.name).toBe('Query');
    expect(body.data.__schema.mutationType.name).toBe('Mutation');
  });

  test('lists issues with selected fields', async () => {
    await request(app).post('/api/issues').send({
      title: 'GraphQL list test',
      description: 'Issue created for GraphQL list query.',
    });

    const { body } = await gql(`
      query {
        issues {
          id
          title
          status
        }
      }
    `);

    expect(body.errors).toBeUndefined();
    expect(body.data.issues.length).toBeGreaterThanOrEqual(1);
    expect(body.data.issues[0].title).toBeDefined();
    expect(body.data.issues[0].description).toBeUndefined();
  });

  test('retrieves a single issue with assignee', async () => {
    const userRes = await request(app).post('/api/users').send({
      name: 'Graph User',
      email: 'graphql-user@example.com',
    });
    const userId = userRes.body.data._id;

    const issueRes = await request(app).post('/api/issues').send({
      title: 'Single GraphQL issue',
      description: 'Issue for single-issue GraphQL query.',
      assignee: userId,
    });
    const issueId = issueRes.body.data._id;

    const { body } = await gql(
      `
      query GetIssue($id: ID!) {
        issue(id: $id) {
          id
          title
          assignee {
            id
            name
            email
          }
        }
      }
    `,
      { id: issueId }
    );

    expect(body.errors).toBeUndefined();
    expect(body.data.issue.title).toBe('Single GraphQL issue');
    expect(body.data.issue.assignee.email).toBe('graphql-user@example.com');
  });

  test('lists users with optional search', async () => {
    await request(app).post('/api/users').send({
      name: 'Searchable GraphQL User',
      email: 'gql-search@example.com',
    });

    const { body } = await gql(`
      query {
        users(search: "gql-search") {
          id
          email
        }
      }
    `);

    expect(body.errors).toBeUndefined();
    expect(body.data.users.some((u) => u.email === 'gql-search@example.com')).toBe(true);
  });

  test('createIssue mutation with variables', async () => {
    const { body } = await gql(
      `
      mutation CreateIssue($input: CreateIssueInput!) {
        createIssue(input: $input) {
          id
          title
          status
          priority
        }
      }
    `,
      {
        input: {
          title: 'GraphQL mutation issue',
          description: 'Created through GraphQL createIssue mutation.',
          priority: 'HIGH',
        },
      }
    );

    expect(body.errors).toBeUndefined();
    expect(body.data.createIssue.title).toBe('GraphQL mutation issue');
    expect(body.data.createIssue.priority).toBe('HIGH');
    expect(body.data.createIssue.status).toBe('OPEN');
  });

  test('createIssue with assignee and rejects invalid assignee', async () => {
    const userRes = await request(app).post('/api/users').send({
      name: 'Assignee GQL',
      email: 'assignee-gql@example.com',
    });

    const ok = await gql(
      `
      mutation CreateIssue($input: CreateIssueInput!) {
        createIssue(input: $input) {
          id
          assignee { email }
        }
      }
    `,
      {
        input: {
          title: 'Assigned via GraphQL',
          description: 'Issue assigned through GraphQL mutation.',
          assigneeId: userRes.body.data._id,
        },
      }
    );
    expect(ok.body.errors).toBeUndefined();
    expect(ok.body.data.createIssue.assignee.email).toBe('assignee-gql@example.com');

    const bad = await gql(
      `
      mutation CreateIssue($input: CreateIssueInput!) {
        createIssue(input: $input) { id }
      }
    `,
      {
        input: {
          title: 'Bad assignee',
          description: 'This should fail because assignee is missing.',
          assigneeId: new mongoose.Types.ObjectId().toString(),
        },
      }
    );
    expect(bad.body.errors).toBeDefined();
    expect(bad.body.errors[0].extensions.code).toBe('INVALID_ASSIGNEE');
    expect(bad.body.errors[0].message).not.toMatch(/mongodb/i);
  });

  test('rejects invalid createIssue input', async () => {
    const { body } = await gql(
      `
      mutation CreateIssue($input: CreateIssueInput!) {
        createIssue(input: $input) { id }
      }
    `,
      {
        input: {
          title: 'Too short',
          description: 'short',
        },
      }
    );
    expect(body.errors).toBeDefined();
    expect(body.errors[0].extensions.code).toBe('VALIDATION_ERROR');
  });

  test('handles nonexistent and invalid issue IDs', async () => {
    const missing = await gql(
      `
      query ($id: ID!) { issue(id: $id) { id } }
    `,
      { id: new mongoose.Types.ObjectId().toString() }
    );
    expect(missing.body.errors).toBeDefined();
    expect(missing.body.errors[0].extensions.code).toBe('NOT_FOUND');

    const invalid = await gql(
      `
      query { issue(id: "not-valid") { id } }
    `
    );
    expect(invalid.body.errors).toBeDefined();
    expect(invalid.body.errors[0].extensions.code).toBe('INVALID_ID');
  });

  test('REST and GraphQL return consistent issue data', async () => {
    const created = await request(app).post('/api/issues').send({
      title: 'Consistency check',
      description: 'Compare REST and GraphQL responses for same record.',
      priority: 'Low',
    });
    const id = created.body.data._id;

    const rest = await request(app).get(`/api/issues/${id}`).expect(200);
    const gqlRes = await gql(
      `
      query ($id: ID!) {
        issue(id: $id) {
          title
          description
          status
          priority
        }
      }
    `,
      { id }
    );

    expect(gqlRes.body.errors).toBeUndefined();
    expect(gqlRes.body.data.issue.title).toBe(rest.body.data.title);
    expect(gqlRes.body.data.issue.description).toBe(rest.body.data.description);
    expect(gqlRes.body.data.issue.status).toBe('OPEN');
    expect(gqlRes.body.data.issue.priority).toBe('LOW');
  });

  test('errors do not expose sensitive internals', async () => {
    const { body } = await gql(
      `
      mutation CreateIssue($input: CreateIssueInput!) {
        createIssue(input: $input) { id }
      }
    `,
      {
        input: {
          title: 'x',
          description: 'too short',
        },
      }
    );
    const message = JSON.stringify(body);
    expect(message).not.toMatch(/MONGODB_URI/i);
    expect(message).not.toMatch(/node_modules/i);
    expect(body.errors[0].extensions).toBeDefined();
  });
});

describe('DateTime scalar', () => {
  test('serializes valid dates to ISO-8601', () => {
    const iso = DateTimeType.serialize(new Date('2024-05-01T12:00:00.000Z'));
    expect(iso).toBe('2024-05-01T12:00:00.000Z');
  });

  test('rejects invalid date input', () => {
    expect(() => DateTimeType.parseValue('not-a-real-date')).toThrow(/invalid date/i);
  });
});
