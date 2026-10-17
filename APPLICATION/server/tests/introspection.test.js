const { validate, parse, NoSchemaIntrospectionCustomRule } = require('graphql');
const { schema } = require('../src/graphql');

describe('GraphQL introspection rules', () => {
  const introspectionQuery = parse('{ __schema { queryType { name } } }');

  test('allows introspection in development configuration (no extra rules)', () => {
    const errors = validate(schema, introspectionQuery);
    expect(errors).toHaveLength(0);
  });

  test('blocks introspection when production rule is applied', () => {
    const errors = validate(schema, introspectionQuery, [NoSchemaIntrospectionCustomRule]);
    expect(errors.length).toBeGreaterThan(0);
  });
});
