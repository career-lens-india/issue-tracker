import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import LoadingMessage from '../components/LoadingMessage';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

function formatDate(value) {
  return new Date(value).toLocaleString();
}

export default function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    api
      .getIssues()
      .then((data) => setIssues(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const stats = {
    total: issues.length,
    open: issues.filter((i) => i.status === 'Open').length,
    inProgress: issues.filter((i) => i.status === 'In Progress').length,
    closed: issues.filter((i) => i.status === 'Closed').length,
  };

  const recent = [...issues]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (loading) return <LoadingMessage text="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="page dashboard-page">
      <div className="page-header">
        <h2>Dashboard</h2>
        <Link to="/issues/new" className="btn primary">New Issue</Link>
      </div>

      <section className="stats-grid">
        <article className="card stat-card">
          <h3>Total Issues</h3>
          <p className="stat-value">{stats.total}</p>
        </article>
        <article className="card stat-card">
          <h3>Open</h3>
          <p className="stat-value">{stats.open}</p>
        </article>
        <article className="card stat-card">
          <h3>In Progress</h3>
          <p className="stat-value">{stats.inProgress}</p>
        </article>
        <article className="card stat-card">
          <h3>Closed</h3>
          <p className="stat-value">{stats.closed}</p>
        </article>
      </section>

      <section className="card">
        <h3>Recent Issues</h3>
        {recent.length === 0 ? (
          <p className="empty-state">No issues yet. Create your first issue to get started.</p>
        ) : (
          <ul className="issue-list compact">
            {recent.map((issue) => (
              <li key={issue._id}>
                <Link to={`/issues/${issue._id}`} className="issue-link">
                  <span className="issue-title">{issue.title}</span>
                  <StatusBadge status={issue.status} />
                  <PriorityBadge priority={issue.priority} />
                </Link>
                <span className="meta">{formatDate(issue.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
