import { Link } from 'react-router-dom';

const SAMPLE_ISSUES = [
  { id: '1', title: 'Fix login button alignment', description: 'Button overlaps on mobile.', status: 'Open', priority: 'Medium' },
  { id: '2', title: 'Add export to CSV', description: 'Users want to download issue lists.', status: 'In Progress', priority: 'High' },
  { id: '3', title: 'Update API docs', description: 'Document new filter parameters.', status: 'Closed', priority: 'Low' },
];

export default function Issues() {
  return (
    <div className="page issues-page">
      <div className="page-header">
        <h2>Issues</h2>
        <Link to="/issues/new" className="btn primary">Create Issue</Link>
      </div>
      <ul className="issue-list">
        {SAMPLE_ISSUES.map((issue) => (
          <li key={issue.id} className="card">
            <strong>{issue.title}</strong>
            <p>{issue.description}</p>
            <span>{issue.status} · {issue.priority}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
