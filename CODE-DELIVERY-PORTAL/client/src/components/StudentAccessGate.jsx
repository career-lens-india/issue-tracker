import { useEffect, useState } from 'react';
import { accessLogin, fetchStages, getWorkshopToken, setWorkshopToken } from '../api';

export default function StudentAccessGate({ children }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      const stored = getWorkshopToken();
      if (!stored) {
        if (!cancelled) setAllowed(false);
        if (!cancelled) setChecking(false);
        return;
      }
      try {
        await fetchStages();
        if (!cancelled) setAllowed(true);
      } catch {
        if (!cancelled) {
          setWorkshopToken('');
          setAllowed(false);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await accessLogin(password);
      await fetchStages();
      setAllowed(true);
      setPassword('');
    } catch (err) {
      setError(err.message || 'Incorrect password');
    }
  }

  if (checking) {
    return <p className="center-msg">Loading…</p>;
  }

  if (allowed) {
    return children;
  }

  return (
    <div className="access-gate">
      <h1>Workshop access</h1>
      <p className="muted">
        Enter the password your instructor shares at the start of the session.
        This portal is only available during class.
      </p>
      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          Session password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            autoFocus
          />
        </label>
        {error && <p className="error-banner">{error}</p>}
        <button type="submit">Enter workshop</button>
      </form>
    </div>
  );
}
