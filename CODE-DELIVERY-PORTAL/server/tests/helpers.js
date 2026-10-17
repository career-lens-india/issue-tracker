const request = require('supertest');
const { connectDatabase, disconnectDatabase } = require('../src/config/db');
const { createApp } = require('../src/app');
const { clearManifestCache } = require('../src/services/manifestService');
const { seedStagesIfNeeded } = require('../src/services/releaseService');
const StageRelease = require('../src/models/StageRelease');

async function setupTestApp() {
  clearManifestCache();
  await disconnectDatabase();
  await connectDatabase(process.env.MONGODB_URI);
  await StageRelease.deleteMany({});
  await seedStagesIfNeeded();
  const app = createApp({ mongoUrl: process.env.MONGODB_URI });
  return app;
}

async function loginStudent(agent) {
  const res = await agent
    .post('/api/access/login')
    .send({ password: process.env.STUDENT_ACCESS_PASSWORD || 'workshop-session-pass' });
  return res;
}

async function loginAdmin(agent) {
  const res = await agent
    .post('/api/admin/login')
    .send({ username: 'testadmin', password: 'test-password-123' });
  return res;
}

async function setStageStatuses(updates) {
  for (const [stageId, status] of Object.entries(updates)) {
    await StageRelease.updateOne({ stageId }, { $set: { status } });
  }
}

module.exports = { setupTestApp, loginStudent, loginAdmin, setStageStatuses };
