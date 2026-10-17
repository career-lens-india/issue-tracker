const request = require('supertest');
const db = require('../src/config/db');
const createApp = require('../src/app');

const app = createApp();

describe('Health and database readiness', () => {
  test('reports connected database with HTTP 200 when MongoDB is ready', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.database).toBe('connected');
    expect(res.body.data.ready).toBe(true);
  });

  test('returns 503 when database is not connected', async () => {
    const spy = jest.spyOn(db, 'getConnectionState').mockReturnValue({
      ready: false,
      state: 0,
    });

    const res = await request(app).get('/api/health').expect(503);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('DATABASE_UNAVAILABLE');
    expect(res.body.data.database).toBe('disconnected');

    spy.mockRestore();
  });

  test('blocks REST data routes when database is unavailable', async () => {
    const spy = jest.spyOn(db, 'getConnectionState').mockReturnValue({
      ready: false,
      state: 0,
    });

    const res = await request(app).get('/api/issues').expect(503);
    expect(res.body.error.code).toBe('DATABASE_UNAVAILABLE');

    spy.mockRestore();
  });

  test('blocks GraphQL when database is unavailable', async () => {
    const spy = jest.spyOn(db, 'getConnectionState').mockReturnValue({
      ready: false,
      state: 0,
    });

    const res = await request(app)
      .post('/graphql')
      .send({ query: '{ issues { id } }' })
      .expect(503);

    expect(res.body.error.code).toBe('DATABASE_UNAVAILABLE');
    spy.mockRestore();
  });
});
