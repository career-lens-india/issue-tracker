const base = import.meta.env.VITE_API_URL || '';

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

export async function adminSession() {
  return parseJson(await fetch(`${base}/api/admin/session`, { credentials: 'include' }));
}

export async function adminLogin(username, password) {
  return parseJson(
    await fetch(`${base}/api/admin/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
  );
}

export async function adminLogout() {
  return parseJson(
    await fetch(`${base}/api/admin/logout`, { method: 'POST', credentials: 'include' })
  );
}

export async function adminStages() {
  return parseJson(await fetch(`${base}/api/admin/stages`, { credentials: 'include' }));
}

export async function adminUpdateStatus(stageId, action) {
  return parseJson(
    await fetch(`${base}/api/admin/stages/${stageId}/status`, {
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
