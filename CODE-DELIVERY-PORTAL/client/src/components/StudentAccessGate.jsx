import { useEffect, useState } from 'react';
import { accessLogin, accessSession } from '../api';

export default function StudentAccessGate({ children }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const data = await accessSession();
        if (!cancelled) {
          setAllowed(!data.required || data.authenticated);
        }
      } catch {
        if (!cancelled) setError('Could not verify workshop access.');
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await accessLogin(password);
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
