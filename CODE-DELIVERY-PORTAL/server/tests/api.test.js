const request = require('supertest');
const { setupTestApp, loginStudent, loginAdmin, setStageStatuses } = require('./helpers');
const StageRelease = require('../src/models/StageRelease');
const { disconnectDatabase } = require('../src/config/db');

describe('portal API', () => {
  let app;

  beforeEach(async () => {
    app = await setupTestApp();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  test('health returns 503 when db disconnected', async () => {
    await disconnectDatabase();
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('DB_NOT_READY');
    await setupTestApp();
  });

  test('student stage routes require workshop password', async () => {
    const res = await request(app).get('/api/stages');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('STUDENT_ACCESS_REQUIRED');
  });

  test('workshop token grants access without session cookie', async () => {
    await setStageStatuses({ 'stage-01': 'LIVE' });
    const login = await request(app)
      .post('/api/access/login')
      .send({ password: process.env.STUDENT_ACCESS_PASSWORD || 'workshop-session-pass' });
    expect(login.status).toBe(200);
    expect(login.body.data.token).toBeTruthy();
    const res = await request(app).get(
      `/api/stages?token=${encodeURIComponent(login.body.data.token)}`
    );
    expect(res.status).toBe(200);
    expect(res.body.data.stages).toHaveLength(1);
  });

  test('student list hides unreleased stages', async () => {
    const agent = request.agent(app);
    await loginStudent(agent);
    const res = await agent.get('/api/stages');
    expect(res.status).toBe(200);
    expect(res.body.data.stages).toHaveLength(0);
  });

  test('student list shows only live and completed stages', async () => {
    await setStageStatuses({ 'stage-01': 'COMPLETED', 'stage-02': 'LIVE' });
    const agent = request.agent(app);
    await loginStudent(agent);
    const res = await agent.get('/api/stages');
    expect(res.status).toBe(200);
    expect(res.body.data.stages).toHaveLength(2);
    expect(res.body.data.stages.map((s) => s.id).sort()).toEqual(['stage-01', 'stage-02']);
    expect(res.body.data.stages.find((s) => s.id === 'stage-03')).toBeUndefined();
  });

  test('coming soon stage detail is forbidden', async () => {
    const agent = request.agent(app);
    await loginStudent(agent);
    const res = await agent.get('/api/stages/stage-01');
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('STAGE_NOT_RELEASED');
  });

  test('live stage exposes starter file not solution', async () => {
    await setStageStatuses({ 'stage-01': 'LIVE' });
    const agent = request.agent(app);
    await loginStudent(agent);
    const detail = await agent.get('/api/stages/stage-01');
    expect(detail.status).toBe(200);
    expect(detail.body.data.stage.instructions).toBeTruthy();
    expect(detail.body.data.stage.solutionFiles).toEqual([]);

    const starter = await agent.get(
      '/api/stages/stage-01/files/starter/client/src/App.jsx'
    );
    expect(starter.status).toBe(200);
    expect(starter.body.data.file.content).toMatch(/function|const|export/i);

    const solution = await agent.get(
      '/api/stages/stage-01/files/solution/client/src/App.jsx'
    );
    expect(solution.status).toBe(403);
    expect(solution.body.error.code).toBe('SOLUTION_WITHHELD');
  });

  test('completed stage exposes solution files', async () => {
    await setStageStatuses({ 'stage-01': 'COMPLETED' });
    const agent = request.agent(app);
    await loginStudent(agent);
    const solution = await agent.get(
      '/api/stages/stage-01/files/solution/client/src/App.jsx'
    );
    expect(solution.status).toBe(200);
    expect(solution.body.data.file.content.length).toBeGreaterThan(10);
  });

  test('invalid stage id rejected', async () => {
    const agent = request.agent(app);
    await loginStudent(agent);
    const res = await agent.get('/api/stages/not-a-stage');
    expect(res.status).toBe(400);
  });

  test('path traversal blocked', async () => {
    await setStageStatuses({ 'stage-01': 'LIVE' });
    const agent = request.agent(app);
    await loginStudent(agent);
    const res = await agent.get(
      '/api/stages/stage-01/files/starter/../../../manifest.json'
    );
    expect([400, 404]).toContain(res.status);
  });

  test('admin endpoints require auth', async () => {
    const res = await request(app).get('/api/admin/stages');
    expect(res.status).toBe(401);
  });

  test('admin login logout', async () => {
    const agent = request.agent(app);
    const login = await loginAdmin(agent);
    expect(login.status).toBe(200);
    expect(login.body.data.token).toBeTruthy();
    const session = await agent.get('/api/admin/session');
    expect(session.body.data.authenticated).toBe(true);
    const tokenSession = await request(app).get(
      `/api/admin/session?token=${encodeURIComponent(login.body.data.token)}`
    );
    expect(tokenSession.body.data.authenticated).toBe(true);
    const logout = await agent.post('/api/admin/logout');
    expect(logout.status).toBe(200);
    const after = await agent.get('/api/admin/session');
    expect(after.body.data.authenticated).toBe(false);
  });

  test('publish live enforces single live stage', async () => {
    const agent = request.agent(app);
    await loginAdmin(agent);
    const res = await agent
      .patch('/api/admin/stages/stage-03/status')
      .send({ action: 'publish_live' });
    expect(res.status).toBe(200);
    const rows = await StageRelease.find().sort({ order: 1 });
    const live = rows.filter((r) => r.status === 'LIVE');
    expect(live).toHaveLength(1);
    expect(live[0].stageId).toBe('stage-03');
    expect(rows.find((r) => r.stageId === 'stage-01').status).toBe('COMPLETED');
    expect(rows.find((r) => r.stageId === 'stage-10').status).toBe('COMING_SOON');
  });

  test('release state persists in database', async () => {
    await setStageStatuses({ 'stage-02': 'LIVE' });
    const stored = await StageRelease.findOne({ stageId: 'stage-02' });
    expect(stored.status).toBe('LIVE');
  });

  test('errors do not expose stack traces', async () => {
    await setStageStatuses({ 'stage-01': 'LIVE' });
    const agent = request.agent(app);
    await loginStudent(agent);
    const res2 = await agent.get('/api/stages/stage-01/files/starter/does-not-exist.js');
    expect(res2.body.stack).toBeUndefined();
    expect(JSON.stringify(res2.body)).not.toMatch(/SESSION_SECRET|ADMIN_PASSWORD/);
  });
});
