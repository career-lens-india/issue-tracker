const request = require('supertest');
const createApp = require('../src/app');

const app = createApp();

describe('Users API', () => {
  test('creates a user with valid data', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        name: 'Alice Dev',
        email: 'alice@example.com',
        department: 'Engineering',
        role: 'Developer',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Alice Dev');
    expect(res.body.data.email).toBe('alice@example.com');
    expect(res.body.data.role).toBe('Developer');
  });

  test('normalizes email to lowercase', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        name: 'Bob',
        email: 'BOB@Example.COM',
      })
      .expect(201);

    expect(res.body.data.email).toBe('bob@example.com');
  });

  test('rejects duplicate email', async () => {
    await request(app)
      .post('/api/users')
      .send({ name: 'One', email: 'dup@example.com' })
      .expect(201);

    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Two', email: 'dup@example.com' })
      .expect(409);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
  });

  test('rejects invalid user data', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: '', email: 'not-an-email' })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  test('lists users and supports search', async () => {
    await request(app).post('/api/users').send({ name: 'Search Me', email: 'find@example.com' });
    await request(app).post('/api/users').send({ name: 'Other', email: 'other@example.com' });

    const all = await request(app).get('/api/users').expect(200);
    expect(all.body.data.length).toBe(2);

    const filtered = await request(app).get('/api/users?search=find').expect(200);
    expect(filtered.body.data.length).toBe(1);
    expect(filtered.body.data[0].email).toBe('find@example.com');
  });
});
