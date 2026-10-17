const { createHandler } = require('graphql-http/lib/use/express');
const { NoSchemaIntrospectionCustomRule } = require('graphql');
const { schema } = require('./index');
const requireDatabase = require('../middleware/requireDatabase');

function setupGraphQL(app) {
  const isProduction = process.env.NODE_ENV === 'production';

  const handler = createHandler({
    schema,
    context: (req) => ({ req }),
    validationRules: isProduction ? [NoSchemaIntrospectionCustomRule] : undefined,
  });

  app.all('/graphql', requireDatabase, handler);
}

module.exports = setupGraphQL;
