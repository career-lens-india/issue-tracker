const API_BASE = import.meta.env.VITE_API_URL || '';

async function parseResponse(response) {
  let body;
  try {
    body = await response.json();
  } catch {
    body = { success: false, error: { message: 'Invalid server response' } };
  }

  if (!response.ok || body.success === false) {
    const message = body.error?.message || `Request failed (${response.status})`;
    const err = new Error(message);
    err.code = body.error?.code;
    err.details = body.error?.details;
    err.status = response.status;
    throw err;
  }

  return body.data;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  return parseResponse(response);
}

export const api = {
  getHealth: () => request('/api/health'),

  getUsers: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    const qs = query.toString();
    return request(`/api/users${qs ? `?${qs}` : ''}`);
  },

  createUser: (payload) =>
    request('/api/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getIssues: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') query.set(key, value);
    });
    const qs = query.toString();
    return request(`/api/issues${qs ? `?${qs}` : ''}`);
  },

  getIssue: (id) => request(`/api/issues/${id}`),

  createIssue: (payload) =>
    request('/api/issues', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateIssue: (id, payload) =>
    request(`/api/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteIssue: (id) =>
    request(`/api/issues/${id}`, {
      method: 'DELETE',
    }),
};
