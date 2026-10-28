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

function withToken(path, token) {
  const pathNorm = path.startsWith('/') ? path : `/${path}`;
  if (!token) return `${base}${pathNorm}`;
  const sep = pathNorm.includes('?') ? '&' : '?';
  return `${base}${pathNorm}${sep}token=${encodeURIComponent(token)}`;
}

function adminApiUrl(path, tokenOverride) {
  return withToken(path, tokenOverride || getAdminToken());
}

function workshopApiUrl(path, tokenOverride) {
  return withToken(path, tokenOverride || getWorkshopToken());
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
  return parseJson(
    await fetch(workshopApiUrl('/api/access/session', tokenOverride), {
      credentials: 'include',
    })
  );
}

export async function accessLogin(password) {
  const data = await parseJson(
    await fetch(`${base}/api/access/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
  );
  if (data.token) setWorkshopToken(data.token);
  return data;
}

export async function fetchStages() {
  return parseJson(
    await fetch(workshopApiUrl('/api/stages'), {
      credentials: 'include',
    })
  );
}

export async function fetchStage(stageId) {
  return parseJson(
    await fetch(workshopApiUrl(`/api/stages/${stageId}`), {
      credentials: 'include',
    })
  );
}

export async function fetchStageFile(stageId, filePath) {
  return parseJson(
    await fetch(workshopApiUrl(`/api/stages/${stageId}/files/${filePath}`), {
      credentials: 'include',
    })
  );
}

export async function adminSession(tokenOverride) {
  return parseJson(
    await fetch(adminApiUrl('/api/admin/session', tokenOverride), {
      credentials: 'include',
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
  const token = getAdminToken();
  setAdminToken('');
  if (!token) return { loggedOut: true };
  return parseJson(
    await fetch(adminApiUrl('/api/admin/logout', token), {
      method: 'POST',
      credentials: 'include',
    })
  );
}

export async function adminStages() {
  return parseJson(
    await fetch(adminApiUrl('/api/admin/stages'), {
      credentials: 'include',
    })
  );
}

export async function adminUpdateStatus(stageId, action) {
  return parseJson(
    await fetch(adminApiUrl(`/api/admin/stages/${stageId}/status`), {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
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

export { getAdminToken, getWorkshopToken };
