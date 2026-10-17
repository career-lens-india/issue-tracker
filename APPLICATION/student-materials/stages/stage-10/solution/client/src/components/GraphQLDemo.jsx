import { useCallback, useEffect, useMemo, useState } from 'react';
import { graphqlRequest } from '../services/graphql';

const FIELD_OPTIONS = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'description', label: 'Description' },
  { key: 'createdAt', label: 'Created At' },
];

const DEFAULT_FIELDS = ['id', 'title', 'status'];

function buildIssuesQuery(selectedFields) {
  const fields = selectedFields.join('\n          ');
  return `
    query ListIssues {
      issues {
        ${fields}
      }
    }
  `;
}

const CREATE_MUTATION = `
  mutation CreateIssue($input: CreateIssueInput!) {
    createIssue(input: $input) {
      id
      title
      status
      priority
      assignee {
        id
        name
        email
      }
    }
  }
`;

export default function GraphQLDemo({ users, onIssueCreated }) {
  const [selectedFields, setSelectedFields] = useState(DEFAULT_FIELDS);
  const [gqlIssues, setGqlIssues] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assigneeId: '',
  });
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createdIssue, setCreatedIssue] = useState(null);

  const issuesQuery = useMemo(() => buildIssuesQuery(selectedFields), [selectedFields]);

  const loadGraphQLIssues = useCallback(async () => {
    setLoadingList(true);
    setListError('');
    try {
      const data = await graphqlRequest(issuesQuery);
      setGqlIssues(data.issues || []);
    } catch (err) {
      setListError(err.message);
      setGqlIssues([]);
    } finally {
      setLoadingList(false);
    }
  }, [issuesQuery]);

  useEffect(() => {
    loadGraphQLIssues();
  }, [loadGraphQLIssues]);

  const toggleField = (key) => {
    setSelectedFields((prev) => {
      if (prev.includes(key)) {
        return prev.length > 1 ? prev.filter((f) => f !== key) : prev;
      }
      return [...prev, key];
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setCreateError('');
    setCreatedIssue(null);

    const input = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
    };
    if (form.assigneeId) input.assigneeId = form.assigneeId;

    try {
      const data = await graphqlRequest(CREATE_MUTATION, { input });
      setCreatedIssue(data.createIssue);
      setForm({ title: '', description: '', priority: 'MEDIUM', assigneeId: '' });
      loadGraphQLIssues();
      if (onIssueCreated) onIssueCreated();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card graphql-demo">
      <h3>REST vs GraphQL demonstration</h3>
      <p className="demo-intro">
        The issue table above uses REST (<code>GET /api/issues</code>) and returns the full
        issue shape defined by the API. Below, the same MongoDB records are loaded through
        GraphQL (<code>POST /graphql</code>), where you choose which fields appear in the
        response.
      </p>

      <div className="demo-columns">
        <div>
          <h4>GraphQL query — field selection</h4>
          <div className="field-toggles">
            {FIELD_OPTIONS.map((opt) => (
              <label key={opt.key} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedFields.includes(opt.key)}
                  onChange={() => toggleField(opt.key)}
                />
                {opt.label}
              </label>
            ))}
          </div>
          <pre className="code-block" aria-label="Generated GraphQL query">
            {issuesQuery.trim()}
          </pre>
          <button
            type="button"
            className="btn secondary"
            onClick={loadGraphQLIssues}
            disabled={loadingList}
          >
            {loadingList ? 'Loading…' : 'Run GraphQL query'}
          </button>
          {listError && <p className="form-error" role="alert">{listError}</p>}
          {!listError && gqlIssues.length > 0 && (
            <ul className="gql-results">
              {gqlIssues.slice(0, 5).map((issue) => (
                <li key={issue.id}>
                  <code>{JSON.stringify(issue)}</code>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4>GraphQL mutation — create issue (variables)</h4>
          <form onSubmit={handleCreate} className="gql-create-form">
            {createError && <p className="form-error" role="alert">{createError}</p>}
            <label>
              Title
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                required
              />
            </label>
            <label>
              Description (min 10 chars)
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                required
                minLength={10}
              />
            </label>
            <label>
              Priority
              <select
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </label>
            <label>
              Assignee (optional)
              <select
                value={form.assigneeId}
                onChange={(e) => setForm((p) => ({ ...p, assigneeId: e.target.value }))}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
            </label>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Submitting…' : 'createIssue mutation'}
            </button>
          </form>
          {createdIssue && (
            <p className="form-success" role="status">
              Created via GraphQL: <code>{JSON.stringify(createdIssue)}</code>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
