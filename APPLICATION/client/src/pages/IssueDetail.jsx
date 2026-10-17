import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import LoadingMessage from '../components/LoadingMessage';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

const STATUSES = ['Open', 'In Progress', 'Closed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export default function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [issue, setIssue] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([api.getIssue(id), api.getUsers()])
      .then(([issueData, usersData]) => {
        setIssue(issueData);
        setForm({
          title: issueData.title,
          description: issueData.description,
          status: issueData.status,
          priority: issueData.priority,
          assignee: issueData.assignee?._id || '',
        });
        setUsers(usersData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

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
    setSuccess('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updated = await api.updateIssue(id, {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
        assignee: form.assignee || null,
      });
      setIssue(updated);
      setSuccess('Issue saved successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this issue permanently?')) return;
    try {
      await api.deleteIssue(id);
      navigate('/issues');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReopen = async () => {
    try {
      const updated = await api.updateIssue(id, { status: 'Open' });
      setIssue(updated);
      setForm((prev) => ({ ...prev, status: 'Open' }));
      setSuccess('Issue reopened.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <LoadingMessage text="Loading issue..." />;
  if (error && !form) return <ErrorMessage message={error} onRetry={load} />;
  if (!form) return null;

  return (
    <div className="page issue-detail-page">
      <div className="page-header">
        <div>
          <h2>Issue Details</h2>
          <p className="meta">
            Created {new Date(issue.createdAt).toLocaleString()} · Updated{' '}
            {new Date(issue.updatedAt).toLocaleString()}
          </p>
        </div>
        <Link to="/issues" className="btn secondary">Back to Issues</Link>
      </div>

      <div className="detail-badges">
        <StatusBadge status={issue.status} />
        <PriorityBadge priority={issue.priority} />
      </div>

      {error && <ErrorMessage message={error} />}
      {success && <p className="form-success" role="status">{success}</p>}

      <form className="card form-card" onSubmit={handleSave}>
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
          Description *
          <textarea
            rows={6}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
          {fieldErrors.description && (
            <span className="field-error">{fieldErrors.description}</span>
          )}
        </label>

        <div className="form-row">
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
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {issue.status === 'Closed' && (
            <button type="button" className="btn secondary" onClick={handleReopen}>
              Reopen Issue
            </button>
          )}
          <button type="button" className="btn danger" onClick={handleDelete}>
            Delete Issue
          </button>
        </div>
      </form>
    </div>
  );
}
