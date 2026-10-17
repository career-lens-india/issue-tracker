const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const { getSessionSecret } = require('./config/env');
const { AppError, sendError } = require('./utils/errors');

const healthRouter = require('./routes/health');
const stagesRouter = require('./routes/stages');
const adminRouter = require('./routes/admin');
const accessRouter = require('./routes/access');

function createApp({ mongoUrl, trustProxy = false } = {}) {
  const app = express();
  if (trustProxy) app.set('trust proxy', 1);

  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5174';
  app.use(
    cors({
      origin: clientOrigin,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));

  const sessionOptions = {
    name: 'portal.sid',
    secret: getSessionSecret(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60 * 1000,
    },
  };

  if (mongoUrl) {
    sessionOptions.store = MongoStore.create({ mongoUrl });
  }

  app.use(session(sessionOptions));

  app.use('/api/health', healthRouter);
  app.use('/api/access', accessRouter);
  app.use('/api/stages', stagesRouter);
  app.use('/api/admin', adminRouter);

  const clientDist = path.join(__dirname, '../../client/dist');
  if (process.env.SERVE_CLIENT === 'true') {
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      return res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.use((err, req, res, next) => {
    if (err instanceof AppError) {
      return sendError(res, err.statusCode, err.code, err.message);
    }
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(err);
    }
    return sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
  });

  return app;
}

module.exports = { createApp };
