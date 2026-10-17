const mongoose = require('mongoose');
const request = require('supertest');
const path = require('path');
const db = require('../src/config/db');
const { resolveAppMode } = require('../src/config/appMode');
const { getMaterialsRoot } = require('../src/config/env');
const { clearManifestCache } = require('../src/services/manifestService');
const { createApp } = require('../src/app');
const { seedStagesIfNeeded } = require('../src/services/releaseService');
const StageRelease = require('../src/models/StageRelease');

const ENV_KEYS = ['APP_MODE', 'NODE_ENV', 'MONGODB_URI', 'ADMIN_USERNAME', 'ADMIN_PASSWORD', 'SESSION_SECRET', 'STUDENT_MATERIALS_PATH'];
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

  test('defaults to dev when APP_MODE unset in development', () => {
    delete process.env.APP_MODE;
    process.env.NODE_ENV = 'development';
    expect(resolveAppMode()).toBe('dev');
  });

  test('initializeDatabase works without MONGODB_URI in dev mode', async () => {
    process.env.APP_MODE = 'dev';
    process.env.NODE_ENV = 'development';
    delete process.env.MONGODB_URI;

    const info = await db.initializeDatabase();
    expect(info.storage).toBe('memory');
    expect(db.isDbReady()).toBe(true);
  });

  test('production mode requires MONGODB_URI and does not use memory', async () => {
    process.env.APP_MODE = 'production';
    process.env.NODE_ENV = 'production';
    delete process.env.MONGODB_URI;

    await expect(db.initializeDatabase()).rejects.toThrow(/MONGODB_URI is required/);
  });

  test('admin session and release transitions work in dev mode', async () => {
    process.env.APP_MODE = 'dev';
    process.env.NODE_ENV = 'development';
    process.env.ADMIN_USERNAME = 'testadmin';
    process.env.ADMIN_PASSWORD = 'test-password-123';
    process.env.STUDENT_ACCESS_PASSWORD = 'workshop-session-pass';
    process.env.SESSION_SECRET = 'test-session-secret-32chars-minimum';
    process.env.STUDENT_MATERIALS_PATH = path.resolve(
      __dirname,
      '../../../APPLICATION/student-materials'
    );
    delete process.env.MONGODB_URI;

    clearManifestCache();
    const info = await db.initializeDatabase();
    await seedStagesIfNeeded();

    const app = createApp({ mongoUrl: info.mongoUri });
    const agent = request.agent(app);

    const login = await agent
      .post('/api/admin/login')
      .send({ username: 'testadmin', password: 'test-password-123' });
    expect(login.status).toBe(200);

    const patch = await agent
      .patch('/api/admin/stages/stage-02/status')
      .send({ action: 'publish_live' });
    expect(patch.status).toBe(200);

    const live = await StageRelease.findOne({ stageId: 'stage-02' });
    expect(live.status).toBe('LIVE');

    const denied = await agent.get('/api/stages/stage-02/files/solution/client/src/App.jsx');
    expect(denied.status).toBe(403);

    const health = await request(app).get('/api/health');
    expect(health.body.data.storage).toBe('memory');
  });

  test('student materials path resolves in dev mode', () => {
    process.env.STUDENT_MATERIALS_PATH = path.resolve(
      __dirname,
      '../../../APPLICATION/student-materials'
    );
    const root = getMaterialsRoot();
    expect(root).toMatch(/student-materials$/);
  });
});
