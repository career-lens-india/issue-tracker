import { useState } from 'react';
import { Link } from 'react-router-dom';

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Open', 'In Progress', 'Closed'];

export default function CreateIssue() {
  const [form, setForm] = useState({ title: '', description: '', status: 'Open', priority: 'Medium' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(null);

  const validate = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.description.trim()) errors.description = 'Description is required';
    else if (form.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted({ ...form, title: form.title.trim(), description: form.description.trim() });
  };

  return (
    <div className="page create-issue-page">
      <div className="page-header">
        <h2>Create Issue</h2>
        <Link to="/issues" className="btn secondary">Back to Issues</Link>
      </div>
      <form className="card form-card" onSubmit={handleSubmit} noValidate>
        <label>
          Title *
          <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          {fieldErrors.title && <span className="field-error">{fieldErrors.title}</span>}
        </label>
        <label>
          Description *
          <textarea rows={5} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          {fieldErrors.description && <span className="field-error">{fieldErrors.description}</span>}
        </label>
        <div className="form-actions">
          <button type="submit" className="btn primary">Validate locally</button>
        </div>
      </form>
      {submitted && <p className="form-success">Local preview: {JSON.stringify(submitted)}</p>}
    </div>
  );
}
