
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

function getSessionCookieOptions(clientOrigin) {
  const isProd = process.env.NODE_ENV === 'production';
  const serveTogether = process.env.SERVE_CLIENT === 'true';
  const localDev =
    !clientOrigin ||
    clientOrigin.includes('localhost') ||
    clientOrigin.includes('127.0.0.1');
  // Frontend and API on different Vercel projects → cross-origin credentialed fetch
  const separateDeploy =
    isProd && !serveTogether && !localDev && Boolean(process.env.VERCEL);

  return {
    httpOnly: true,
    sameSite: separateDeploy ? 'none' : 'lax',
    secure: isProd,
    maxAge: 8 * 60 * 60 * 1000,
  };
}

function createApp({ mongoUrl, trustProxy = false } = {}) {
  const app = express();

  if (trustProxy) app.set('trust proxy', 1);

  // CHANGED: Allow the configured origin and known frontend deployments.
  const allowedOrigins = [
    process.env.CLIENT_ORIGIN,
    'https://code-delivery-platform.vercel.app',
    'https://code-delivery-platform-h9uu3zl1p-elva-prabhu.vercel.app',
    'https://code-delivery-platform-ao9ppnwtx-elva-prabhu.vercel.app',
  ].filter(Boolean);

  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests without an Origin header (e.g. server-to-server).
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // CHANGED: Reject unknown origins.
      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // NEW
    allowedHeaders: ['Content-Type', 'Authorization'], // NEW
    optionsSuccessStatus: 204, // NEW
  };

  // CHANGED: Apply CORS before routes and session middleware.
  app.use(cors(corsOptions));

  // NEW: Explicitly respond to preflight requests.
  app.options(/.*/, cors(corsOptions));

  app.use(express.json({ limit: '1mb' }));

  const sessionOptions = {
    name: 'portal.sid',
    secret: getSessionSecret(),
    resave: false,
    saveUninitialized: false,
    cookie: getSessionCookieOptions(clientOrigin),
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
      console.error(err);
    }

    return sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
  });

  return app;
}

module.exports = { createApp };
