import { useEffect, useState } from 'react';
import {
  adminLogin,
  adminLogout,
  adminStages,
  adminUpdateStatus,
  getAdminToken,
  setAdminToken,
} from '../api';
import { statusLabel } from '../statusLabels';

const ACTIONS = [
  { action: 'publish_live', label: 'Publish as Live', hint: 'Sets this stage Live, earlier Completed, later Coming Soon.' },
  { action: 'mark_completed', label: 'Mark Completed', hint: 'Removes Live status from this stage without auto-publishing the next.' },
  { action: 'coming_soon', label: 'Return to Coming Soon', hint: 'Hides materials; ensure only one Live stage remains.' },
];

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [stages, setStages] = useState([]);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      const token = getAdminToken();
      if (!token) {
        if (!cancelled) setSession({ authenticated: false });
        return;
      }
      try {
        const data = await adminStages();
        if (cancelled) return;
        setStages(data.stages);
        setSession({ authenticated: true, username: loginData.username || 'admin' });
      } catch {
        if (cancelled) return;
        setAdminToken('');
        setSession({ authenticated: false });
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadStages() {
    const data = await adminStages();
    setStages(data.stages);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError('');
    try {
      const loginData = await adminLogin(username, password);
      setPassword('');
      setSession({ authenticated: true, username: loginData.username });
      await loadStages();
    } catch (err) {
      setLoginError(err.message || 'Login failed');
    }
  }

  async function handleLogout() {
    await adminLogout();
    setStages([]);
    setSession({ authenticated: false });
  }

  function confirmAction(stage, action) {
    setPending({ stage, action });
    setMessage('');
  }

  async function runPending() {
    if (!pending) return;
    try {
      await adminUpdateStatus(pending.stage.id, pending.action);
      setMessage(`Updated ${pending.stage.id} successfully.`);
      setPending(null);
      await loadStages();
    } catch (err) {
      setMessage(err.message || 'Update failed');
      setPending(null);
    }
  }

  if (!session?.authenticated) {
    return (
      <div className="admin-page">
        <h2>Admin login</h2>
        <p className="muted">Credentials are configured on the server via environment variables.</p>
        <form className="login-form" onSubmit={handleLogin}>
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {loginError && <p className="error-banner">{loginError}</p>}
          <button type="submit">Sign in</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-toolbar">
        <h2>Release management</h2>
        <button type="button" className="secondary" onClick={handleLogout}>Log out</button>
      </div>
      <div className="rules-box">
        <h3>Transition rules</h3>
        <ol>
          <li>Initially all stages are Coming Soon until you publish.</li>
          <li>Publishing stage N as Live marks earlier stages Completed, N Live, and later Coming Soon.</li>
          <li>At most one stage may be Live.</li>
          <li>Mark Completed removes Live without publishing the next stage.</li>
          <li>Returning to Coming Soon must not leave multiple Live stages.</li>
        </ol>
      </div>
      {message && <p className={message.includes('failed') ? 'error-banner' : 'success-banner'}>{message}</p>}
      {pending && (
        <div className="confirm-box">
          <p>
            Confirm <strong>{ACTIONS.find((a) => a.action === pending.action)?.label}</strong> for{' '}
            <strong>Stage {pending.stage.order}</strong>?
          </p>
          <button type="button" onClick={runPending}>Confirm</button>
          <button type="button" className="secondary" onClick={() => setPending(null)}>Cancel</button>
        </div>
      )}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Stage</th>
            <th>Title</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stages.map((s) => (
            <tr key={s.id}>
              <td>{s.order}</td>
              <td>{s.title}</td>
              <td>{statusLabel(s.status)}</td>
              <td className="actions-cell">
                {ACTIONS.map((a) => (
                  <button
                    key={a.action}
                    type="button"
                    title={a.hint}
                    onClick={() => confirmAction(s, a.action)}
                  >
                    {a.label}
                  </button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
