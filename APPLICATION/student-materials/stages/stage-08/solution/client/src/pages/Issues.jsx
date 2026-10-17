import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import LoadingMessage from '../components/LoadingMessage';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

const STATUSES = ['', 'Open', 'In Progress', 'Closed'];
const PRIORITIES = ['', 'Low', 'Medium', 'High'];

function excerpt(text, max = 100) {
  if (!text) return '';
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString();
}

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    assignee: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const loadIssues = useCallback(() => {
    setLoading(true);
    setError('');
    api
      .getIssues(filters)
      .then((data) => setIssues(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    api.getUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuickStatus = async (issue, newStatus) => {
    try {
      await api.updateIssue(issue._id, { status: newStatus });
      loadIssues();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (issue) => {
    if (!window.confirm(`Delete issue "${issue.title}"?`)) return;
    setDeletingId(issue._id);
    try {
      await api.deleteIssue(issue._id);
      loadIssues();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div className="page issues-page">
      <div className="page-header">
        <h2>Issues</h2>
        <Link to="/issues/new" className="btn primary">Create Issue</Link>
      </div>

      <section className="card filters-card">
        <div className="filters-grid">
          <label>
            Search
            <input
              type="search"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Title or description"
            />
          </label>
          <label>
            Status
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All</option>
              {STATUSES.filter(Boolean).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">All</option>
              {PRIORITIES.filter(Boolean).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <label>
            Assignee
            <select
              value={filters.assignee}
              onChange={(e) => handleFilterChange('assignee', e.target.value)}
            >
              <option value="">All</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {loading && <LoadingMessage text="Loading issues..." />}
      {error && <ErrorMessage message={error} onRetry={loadIssues} />}

      {!loading && !error && issues.length === 0 && (
        <p className="empty-state">No issues match your filters.</p>
      )}

      {!loading && !error && issues.length > 0 && (
        <div className="issue-table-wrapper card">
          <table className="issue-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assignee</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue._id}>
                  <td>
                    <Link to={`/issues/${issue._id}`} className="issue-title-link">
                      {issue.title}
                    </Link>
                    <p className="issue-excerpt">{excerpt(issue.description)}</p>
                  </td>
                  <td><StatusBadge status={issue.status} /></td>
                  <td><PriorityBadge priority={issue.priority} /></td>
                  <td>
                    {issue.assignee
                      ? `${issue.assignee.name} (${issue.assignee.email})`
                      : 'Unassigned'}
                  </td>
                  <td>{formatDate(issue.createdAt)}</td>
                  <td className="actions-cell">
                    <select
                      value={issue.status}
                      onChange={(e) => handleQuickStatus(issue, e.target.value)}
                      aria-label={`Change status for ${issue.title}`}
                    >
                      {STATUSES.filter(Boolean).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <Link to={`/issues/${issue._id}`} className="btn small secondary">
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn small danger"
                      disabled={deletingId === issue._id}
                      onClick={() => handleDelete(issue)}
                    >
                      {deletingId === issue._id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
