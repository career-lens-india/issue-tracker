import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import LoadingMessage from '../components/LoadingMessage';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

function excerpt(text, max = 100) {
  if (!text) return '';
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString();
}

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadIssues = () => {
    setLoading(true);
    setError('');
    api
      .getIssues()
      .then((data) => setIssues(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadIssues();
  }, []);

  return (
    <div className="page issues-page">
      <div className="page-header">
        <h2>Issues</h2>
        <Link to="/issues/new" className="btn primary">Create Issue</Link>
      </div>

      {loading && <LoadingMessage text="Loading issues..." />}
      {error && <ErrorMessage message={error} onRetry={loadIssues} />}

      {!loading && !error && issues.length === 0 && (
        <p className="empty-state">No issues yet.</p>
      )}

      {!loading && !error && issues.length > 0 && (
        <div className="issue-table-wrapper card">
          <table className="issue-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue._id}>
                  <td>
                    <span className="issue-title-link">{issue.title}</span>
                    <p className="issue-excerpt">{excerpt(issue.description)}</p>
                  </td>
                  <td><StatusBadge status={issue.status} /></td>
                  <td><PriorityBadge priority={issue.priority} /></td>
                  <td>{formatDate(issue.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
