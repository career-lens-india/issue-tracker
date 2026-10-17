import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import LoadingMessage from '../components/LoadingMessage';
import ErrorMessage from '../components/ErrorMessage';

const ROLES = ['Developer', 'Tester', 'Designer', 'Project Manager'];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    role: 'Developer',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = useCallback(() => {
    setLoading(true);
    setError('');
    api
      .getUsers({ search })
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(loadUsers, 300);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    const email = form.email.trim().toLowerCase();
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Enter a valid email address';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setFormError('');
    setSuccess('');

    try {
      await api.createUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        department: form.department.trim(),
        role: form.role,
      });
      setForm({ name: '', email: '', department: '', role: 'Developer' });
      setShowForm(false);
      setSuccess('User added successfully.');
      loadUsers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page users-page">
      <div className="page-header">
        <h2>Users</h2>
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            setShowForm((v) => !v);
            setFormError('');
          }}
        >
          {showForm ? 'Close Form' : 'Add User'}
        </button>
      </div>

      <section className="card filters-card">
        <label>
          Search users
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or email"
          />
        </label>
      </section>

      {showForm && (
        <form className="card form-card" onSubmit={handleSubmit}>
          <h3>New Team Member</h3>
          {formError && <p className="form-error" role="alert">{formError}</p>}

          <label>
            Name *
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
            {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
          </label>

          <label>
            Email *
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </label>

          <label>
            Department
            <input
              type="text"
              value={form.department}
              onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
            />
          </label>

          <label>
            Role
            <select
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>

          <div className="form-actions">
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save User'}
            </button>
          </div>
        </form>
      )}

      {success && <p className="form-success" role="status">{success}</p>}

      {loading && <LoadingMessage text="Loading users..." />}
      {error && <ErrorMessage message={error} onRetry={loadUsers} />}

      {!loading && !error && users.length === 0 && (
        <p className="empty-state">No users found. Add a team member to assign issues.</p>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="card">
          <table className="issue-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.department || '—'}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
