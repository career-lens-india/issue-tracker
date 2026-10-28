/**
 * API client — split frontend/API deploy (e.g. two Vercel projects).
 * Auth is ONLY via signed tokens: POST login returns `token`, stored in sessionStorage,
 * sent on every protected request as `Authorization: Bearer <token>`.
 * Session cookies are not used cross-origin.
 */
const base = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const ADMIN_TOKEN_KEY = 'portal.adminToken';
const WORKSHOP_TOKEN_KEY = 'portal.workshopToken';

function getAdminToken() {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

function setAdminToken(token) {
  try {
    if (token) sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    else sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

function getWorkshopToken() {
  try {
    return sessionStorage.getItem(WORKSHOP_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

function setWorkshopToken(token) {
  try {
    if (token) sessionStorage.setItem(WORKSHOP_TOKEN_KEY, token);
    else sessionStorage.removeItem(WORKSHOP_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

function apiUrl(path) {
  const pathNorm = path.startsWith('/') ? path : `/${path}`;
  return `${base}${pathNorm}`;
}

function bearerHeaders(token) {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function portalFetch(path, { method = 'GET', token, jsonBody } = {}) {
  const headers = bearerHeaders(token);
  let body;
  if (jsonBody !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(jsonBody);
  }
  return fetch(apiUrl(path), { method, headers, body });
}

async function parseJson(res) {
  const body = await res.json();
  if (!body.success) {
    const message = body?.error?.message || 'Request failed';
    const err = new Error(message);
    err.code = body?.error?.code;
    err.status = res.status;
    throw err;
  }
  return body.data;
}

export async function accessSession(tokenOverride) {
  const token = tokenOverride || getWorkshopToken();
  return parseJson(
    await portalFetch('/api/access/session', {
      method: 'POST',
      token,
      jsonBody: token ? { token } : {},
    })
  );
}

export async function accessLogin(password) {
  const data = await parseJson(
    await portalFetch('/api/access/login', {
      method: 'POST',
      jsonBody: { password },
    })
  );
  if (!data.token) {
    throw new Error('Workshop login did not return a token. Redeploy the API.');
  }
  setWorkshopToken(data.token);
  return data;
}

export async function fetchStages() {
  const token = getWorkshopToken();
  if (!token) {
    const err = new Error('Workshop password required');
    err.code = 'STUDENT_ACCESS_REQUIRED';
    throw err;
  }
  return parseJson(await portalFetch('/api/stages', { token }));
}

export async function fetchStage(stageId) {
  return parseJson(
    await portalFetch(`/api/stages/${stageId}`, { token: getWorkshopToken() })
  );
}

export async function fetchStageFile(stageId, filePath) {
  return parseJson(
    await portalFetch(`/api/stages/${stageId}/files/${filePath}`, {
      token: getWorkshopToken(),
    })
  );
}

export async function adminSession(tokenOverride) {
  const token = tokenOverride || getAdminToken();
  return parseJson(
    await portalFetch('/api/admin/session', {
      method: 'POST',
      token,
      jsonBody: token ? { token } : {},
    })
  );
}

export async function adminLogin(username, password) {
  const data = await parseJson(
    await portalFetch('/api/admin/login', {
      method: 'POST',
      jsonBody: { username, password },
    })
  );
  if (!data.token) {
    throw new Error('Admin login did not return a token. Redeploy the API.');
  }
  setAdminToken(data.token);
  return data;
}

export async function adminLogout() {
  const token = getAdminToken();
  setAdminToken('');
  if (!token) return { loggedOut: true };
  return parseJson(
    await portalFetch('/api/admin/logout', { method: 'POST', token })
  );
}

export async function adminStages() {
  return parseJson(
    await portalFetch('/api/admin/stages', { token: getAdminToken() })
  );
}

export async function adminUpdateStatus(stageId, action) {
  return parseJson(
    await portalFetch(`/api/admin/stages/${stageId}/status`, {
      method: 'PATCH',
      token: getAdminToken(),
      jsonBody: { action },
    })
  );
}

export function downloadFile(stageId, filePath, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const name = filePath.split('/').pop() || 'file.txt';
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export { getAdminToken, getWorkshopToken, setWorkshopToken, setAdminToken };
