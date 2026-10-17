const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const path = require('path');

let mongoServer;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.APP_MODE = 'test';
  process.env.ADMIN_USERNAME = 'testadmin';
  process.env.ADMIN_PASSWORD = 'test-password-123';
  process.env.STUDENT_ACCESS_PASSWORD = 'workshop-session-pass';
  process.env.SESSION_SECRET = 'test-session-secret-32chars-minimum';
  process.env.STUDENT_MATERIALS_PATH = path.resolve(
    __dirname,
    '../../../APPLICATION/student-materials'
  );
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});
