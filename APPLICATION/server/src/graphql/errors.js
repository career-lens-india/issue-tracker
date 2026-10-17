const { GraphQLError } = require('graphql');
const { AppError } = require('../utils/errors');

function toGraphQLError(err) {
  if (err instanceof GraphQLError) {
    return err;
  }

  if (err instanceof AppError) {
    return new GraphQLError(err.message, {
      extensions: {
        code: err.code,
        details: err.details,
      },
    });
  }

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return new GraphQLError('Validation failed', {
      extensions: { code: 'VALIDATION_ERROR', details },
    });
  }

  console.error('[graphql]', err.message);
  return new GraphQLError('An unexpected error occurred', {
    extensions: { code: 'INTERNAL_ERROR' },
  });
}

module.exports = {
  toGraphQLError,
};
