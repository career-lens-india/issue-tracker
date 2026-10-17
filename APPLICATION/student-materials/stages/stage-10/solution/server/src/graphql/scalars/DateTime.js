const { GraphQLScalarType, GraphQLError, Kind } = require('graphql');

function parseDateValue(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new GraphQLError('DateTime cannot represent an invalid date value', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  return date;
}

const DateTimeType = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO-8601 date-time string',
  serialize(value) {
    const date = parseDateValue(value);
    return date.toISOString();
  },
  parseValue(value) {
    return parseDateValue(value);
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError('DateTime must be provided as a string literal', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
    return parseDateValue(ast.value);
  },
});

module.exports = DateTimeType;
