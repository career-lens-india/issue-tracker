const mongoose = require('mongoose');
const request = require('supertest');
const db = require('../src/config/db');
const { resolveAppMode } = require('../src/config/appMode');
const createApp = require('../src/app');

const ENV_KEYS = ['APP_MODE', 'NODE_ENV', 'MONGODB_URI'];
let baselineEnv = {};

describe('database modes', () => {
  beforeAll(() => {
    ENV_KEYS.forEach((key) => {
      baselineEnv[key] = process.env[key];
    });
  });

  afterEach(async () => {
    await db.shutdownDatabase();
    ENV_KEYS.forEach((key) => {
      if (baselineEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = baselineEnv[key];
      }
    });
    if (mongoose.connection.readyState === 0 && process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  test('defaults to dev mode when APP_MODE is unset in non-production', () => {
    delete process.env.APP_MODE;
    process.env.NODE_ENV = 'development';
    expect(resolveAppMode()).toBe('dev');
  });

  test('initializeDatabase starts in-memory MongoDB without MONGODB_URI in dev mode', async () => {
    process.env.APP_MODE = 'dev';
    process.env.NODE_ENV = 'development';
    delete process.env.MONGODB_URI;

    const info = await db.initializeDatabase();
    expect(info.appMode).toBe('dev');
    expect(info.storage).toBe('memory');
    expect(db.getConnectionState().ready).toBe(true);
  });

  test('student mode requires MONGODB_URI', async () => {
    process.env.APP_MODE = 'student';
    process.env.NODE_ENV = 'development';
    delete process.env.MONGODB_URI;

    await expect(db.initializeDatabase()).rejects.toThrow(/MONGODB_URI is required/);
  });

  test('student mode uses configured external URI', async () => {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const external = await MongoMemoryServer.create();
    process.env.APP_MODE = 'student';
    process.env.MONGODB_URI = external.getUri();

    const info = await db.initializeDatabase();
    expect(info.storage).toBe('external');
    expect(info.appMode).toBe('student');

    await db.shutdownDatabase();
    await external.stop();
  });

  test('REST and GraphQL share data in dev mode', async () => {
    process.env.APP_MODE = 'dev';
    process.env.NODE_ENV = 'development';
    delete process.env.MONGODB_URI;
    await db.initializeDatabase();

    const app = createApp();
    const createRes = await request(app)
      .post('/api/issues')
      .send({
        title: 'Mode test issue',
        description: 'Shared store for REST and GraphQL mode test.',
        status: 'Open',
        priority: 'Low',
      });
    expect(createRes.status).toBe(201);

    const gqlRes = await request(app)
      .post('/graphql')
      .send({ query: '{ issues { title } }' });
    expect(gqlRes.status).toBe(200);
    const titles = gqlRes.body.data.issues.map((i) => i.title);
    expect(titles).toContain('Mode test issue');
  });

  test('health reports in-memory storage in dev mode', async () => {
    process.env.APP_MODE = 'dev';
    process.env.NODE_ENV = 'development';
    delete process.env.MONGODB_URI;
    await db.initializeDatabase();

    const app = createApp();
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body.data.storage).toBe('memory');
    expect(res.body.data.appMode).toBe('dev');
  });

  test('rejects unsupported APP_MODE', () => {
    process.env.APP_MODE = 'invalid';
    expect(() => resolveAppMode()).toThrow(/Unsupported APP_MODE/);
  });
});
