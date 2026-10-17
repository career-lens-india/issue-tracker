import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import LoadingMessage from '../components/LoadingMessage';

const STATUSES = ['Open', 'In Progress', 'Closed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export default function CreateIssue() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'Open',
    priority: 'Medium',
    assignee: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    api
      .getUsers()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false));
  }, []);

  const validate = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.description.trim()) {
      errors.description = 'Description is required';
    } else if (form.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setApiError('');

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      assignee: form.assignee || null,
    };

    try {
      const created = await api.createIssue(payload);
      navigate(`/issues/${created._id}`);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loadingUsers) return <LoadingMessage text="Loading form..." />;

  return (
    <div className="page create-issue-page">
      <div className="page-header">
        <h2>Create Issue</h2>
        <Link to="/issues" className="btn secondary">Back to Issues</Link>
      </div>

      <form className="card form-card" onSubmit={handleSubmit} noValidate>
        {apiError && <p className="form-error" role="alert">{apiError}</p>}

        <label>
          Title *
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
          {fieldErrors.title && <span className="field-error">{fieldErrors.title}</span>}
        </label>

        <label>
          Description * (min 10 characters)
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
          {fieldErrors.description && (
            <span className="field-error">{fieldErrors.description}</span>
          )}
        </label>

        <div className="form-row">
          <label>
            Priority
            <select
              value={form.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Assignee
          <select
            value={form.assignee}
            onChange={(e) => handleChange('assignee', e.target.value)}
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.name} — {u.email}</option>
            ))}
          </select>
        </label>

        <div className="form-actions">
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? 'Saving…' : 'Create Issue'}
          </button>
        </div>
      </form>
    </div>
  );
}
