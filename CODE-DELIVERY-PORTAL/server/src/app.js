const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const path = require('path');
const { getSessionSecret } = require('./config/env');
const {
  getSessionCookieOptions,
  isOriginAllowed,
  parseAllowedOrigins,
} = require('./config/sessionCookie');
const { AppError, sendError } = require('./utils/errors');

const healthRouter = require('./routes/health');
const stagesRouter = require('./routes/stages');
const adminRouter = require('./routes/admin');
const accessRouter = require('./routes/access');

function createApp({ mongoUrl, trustProxy = false } = {}) {
  const app = express();
  if (trustProxy || process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  const allowedOrigins = parseAllowedOrigins();

  if (process.env.NODE_ENV === 'production' && allowedOrigins.size === 0) {
    throw new Error('CLIENT_ORIGIN (or ALLOWED_ORIGINS) is required in production');
  }

  const corsOptions = {
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        return callback(null, origin || true);
      }
      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Token'],
  };

  app.use(cors(corsOptions));
  app.options(/.*/, cors(corsOptions));
  app.use(express.json({ limit: '1mb' }));

  const cookieOptions = getSessionCookieOptions(clientOrigin);
  const sessionOptions = {
    name: 'portal.sid',
    secret: getSessionSecret(),
    resave: false,
    saveUninitialized: false,
    proxy: process.env.NODE_ENV === 'production',
    cookie: cookieOptions,
  };

  if (mongoUrl) {
    const storeOptions =
      mongoose.connection.readyState === 1
        ? { client: mongoose.connection.getClient() }
        : { mongoUrl };
    sessionOptions.store = MongoStore.create(storeOptions);
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
