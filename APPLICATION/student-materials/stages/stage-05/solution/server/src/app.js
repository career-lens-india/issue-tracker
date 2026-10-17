const express = require('express');
const cors = require('cors');
const requestLogger = require('./middleware/requestLogger');
const apiRoutes = require('./routes');
const setupGraphQL = require('./graphql/setupGraphQL');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.use('/api', apiRoutes);
  setupGraphQL(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
