const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Execute a GraphQL request against /graphql.
 * Returns { data, errors } so callers can distinguish partial failures.
 */
export async function graphqlRequest(query, variables) {
  const response = await fetch(`${API_BASE}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error('Invalid GraphQL response from server');
  }

  if (body.errors && body.errors.length > 0) {
    const err = new Error(body.errors[0].message || 'GraphQL request failed');
    err.graphqlErrors = body.errors;
    err.code = body.errors[0].extensions?.code;
    err.data = body.data;
    throw err;
  }

  if (!response.ok) {
    throw new Error(`GraphQL HTTP error (${response.status})`);
  }

  return body.data;
}
