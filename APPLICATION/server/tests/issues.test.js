const request = require('supertest');
const mongoose = require('mongoose');
const createApp = require('../src/app');

const app = createApp();

async function createUser(overrides = {}) {
  const res = await request(app)
    .post('/api/users')
    .send({
      name: 'Assignee User',
      email: 'assignee@example.com',
      ...overrides,
    });
  return res.body.data;
}

describe('Issues API', () => {
  test('creates an issue with validation', async () => {
    const res = await request(app)
      .post('/api/issues')
      .send({
        title: 'Bug in login',
        description: 'Users cannot log in on mobile devices.',
        priority: 'High',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('Open');
    expect(res.body.data.priority).toBe('High');
  });

  test('rejects short description', async () => {
    const res = await request(app)
      .post('/api/issues')
      .send({
        title: 'Bad',
        description: 'short',
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('lists, searches, and filters issues', async () => {
    const user = await createUser();
    await request(app).post('/api/issues').send({
      title: 'Alpha task',
      description: 'First issue for filtering tests.',
      status: 'Open',
      priority: 'Low',
    });
    await request(app).post('/api/issues').send({
      title: 'Beta task',
      description: 'Second issue closed for tests.',
      status: 'Closed',
      priority: 'High',
      assignee: user._id,
    });

    const list = await request(app).get('/api/issues').expect(200);
    expect(list.body.data.length).toBe(2);

    const search = await request(app).get('/api/issues?search=Alpha').expect(200);
    expect(search.body.data.length).toBe(1);

    const byStatus = await request(app).get('/api/issues?status=Closed').expect(200);
    expect(byStatus.body.data.length).toBe(1);

    const byPriority = await request(app).get('/api/issues?priority=Low').expect(200);
    expect(byPriority.body.data.length).toBe(1);

    const byAssignee = await request(app).get(`/api/issues?assignee=${user._id}`).expect(200);
    expect(byAssignee.body.data.length).toBe(1);
    expect(byAssignee.body.data[0].assignee.email).toBe('assignee@example.com');
  });

  test('rejects invalid filter values', async () => {
    const res = await request(app).get('/api/issues?status=Invalid').expect(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('gets a single issue and returns 404 when missing', async () => {
    const created = await request(app)
      .post('/api/issues')
      .send({
        title: 'Single',
        description: 'Fetch by id test issue.',
      })
      .expect(201);

    const id = created.body.data._id;
    const got = await request(app).get(`/api/issues/${id}`).expect(200);
    expect(got.body.data.title).toBe('Single');

    const missing = await request(app)
      .get(`/api/issues/${new mongoose.Types.ObjectId()}`)
      .expect(404);
    expect(missing.body.error.code).toBe('NOT_FOUND');
  });

  test('updates and deletes an issue', async () => {
    const created = await request(app)
      .post('/api/issues')
      .send({
        title: 'Update me',
        description: 'Issue to update and delete.',
      })
      .expect(201);

    const id = created.body.data._id;

    const updated = await request(app)
      .put(`/api/issues/${id}`)
      .send({ status: 'In Progress', priority: 'High' })
      .expect(200);

    expect(updated.body.data.status).toBe('In Progress');

    await request(app).delete(`/api/issues/${id}`).expect(200);
    await request(app).get(`/api/issues/${id}`).expect(404);
  });

  test('assigns existing user and rejects invalid assignee', async () => {
    const user = await createUser({ email: 'valid@example.com' });

    const withAssignee = await request(app)
      .post('/api/issues')
      .send({
        title: 'Assigned',
        description: 'Issue with a valid assignee.',
        assignee: user._id,
      })
      .expect(201);

    expect(withAssignee.body.data.assignee.name).toBe('Assignee User');

    const badAssignee = await request(app)
      .post('/api/issues')
      .send({
        title: 'Bad assign',
        description: 'Issue with invalid assignee id.',
        assignee: new mongoose.Types.ObjectId().toString(),
      })
      .expect(400);

    expect(badAssignee.body.error.code).toBe('INVALID_ASSIGNEE');
  });

  test('returns error for invalid issue id format', async () => {
    const res = await request(app).get('/api/issues/not-a-valid-id').expect(400);
    expect(res.body.error.code).toBe('INVALID_ID');
  });

  test('health check reports service status', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.service).toBe('ok');
    expect(res.body.data.database).toBe('connected');
  });
});
