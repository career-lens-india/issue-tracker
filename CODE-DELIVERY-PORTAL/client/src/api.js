const base = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const ADMIN_TOKEN_KEY = 'portal.adminToken';

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

function adminHeaders(extra = {}, tokenOverride) {
  const headers = { ...extra };
  const token = tokenOverride || getAdminToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers['X-Admin-Token'] = token;
  }
  return headers;
}

async function parseJson(res) {
  const body = await res.json();
  if (!res.ok) {
    const message = body?.error?.message || 'Request failed';
    const err = new Error(message);
    err.code = body?.error?.code;
    err.status = res.status;
    throw err;
  }
  return body.data;
}

export async function accessSession() {
  return parseJson(await fetch(`${base}/api/access/session`, { credentials: 'include' }));
}

export async function accessLogin(password) {
  return parseJson(
    await fetch(`${base}/api/access/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
  );
}

export async function fetchStages() {
  return parseJson(await fetch(`${base}/api/stages`, { credentials: 'include' }));
}

export async function fetchStage(stageId) {
  return parseJson(await fetch(`${base}/api/stages/${stageId}`, { credentials: 'include' }));
}

export async function fetchStageFile(stageId, filePath) {
  return parseJson(
    await fetch(`${base}/api/stages/${stageId}/files/${filePath}`, { credentials: 'include' })
  );
}

export async function adminSession(tokenOverride) {
  return parseJson(
    await fetch(`${base}/api/admin/session`, {
      credentials: 'include',
      headers: adminHeaders({}, tokenOverride),
    })
  );
}

export async function adminLogin(username, password) {
  const data = await parseJson(
    await fetch(`${base}/api/admin/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
  );
  if (data.token) setAdminToken(data.token);
  return data;
}

export async function adminLogout() {
  setAdminToken('');
  return parseJson(
    await fetch(`${base}/api/admin/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: adminHeaders(),
    })
  );
}

export async function adminStages() {
  return parseJson(
    await fetch(`${base}/api/admin/stages`, {
      credentials: 'include',
      headers: adminHeaders(),
    })
  );
}

export async function adminUpdateStatus(stageId, action) {
  return parseJson(
    await fetch(`${base}/api/admin/stages/${stageId}/status`, {
      method: 'PATCH',
      credentials: 'include',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ action }),
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
