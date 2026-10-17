import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(__dirname, '../stages');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function write(stageRel, content) {
  const full = path.join(OUT, stageRel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

function copyTo(stage, kind, refRel) {
  write(`stage-${stage}/${kind}/${refRel}`, read(refRel));
}

function walkCopy(stage, kind, refDir, outPrefix) {
  const base = path.join(ROOT, refDir);
  for (const name of fs.readdirSync(base, { withFileTypes: true })) {
    const rel = `${outPrefix}/${name.name}`;
    if (name.isDirectory()) walkCopy(stage, kind, `${refDir}/${name.name}`, rel);
    else write(`stage-${stage}/${kind}/${rel}`, fs.readFileSync(path.join(base, name.name), 'utf8'));
  }
}

function stripGraphQLDemo(src) {
  return src
    .replace(/import GraphQLDemo from ['"]\.\.\/components\/GraphQLDemo['"];\r?\n/, '')
    .replace(/\r?\n\s*<GraphQLDemo users=\{users\} onIssueCreated=\{loadIssues\} \/>\r?\n/, '\n');
}

function stripMutationTypeDefs(src) {
  return src.replace(/\s*type Mutation \{[\s\S]*?\}\s*/, '\n');
}

function stripMutationBlock(src) {
  const start = src.indexOf('  Mutation:');
  if (start === -1) return src;
  const issueIdx = src.indexOf('  Issue:', start);
  return src.slice(0, start) + src.slice(issueIdx);
}

const issuesStage7 = `import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import LoadingMessage from '../components/LoadingMessage';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

function excerpt(text, max = 100) {
  if (!text) return '';
  return text.length <= max ? text : \`\${text.slice(0, max)}…\`;
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
`;

fs.rmSync(OUT, { recursive: true, force: true });

const clientPkg = read('client/package.json');
const indexHtml = read('client/index.html');
const mainJsx = read('client/src/main.jsx');
const appFull = read('client/src/App.jsx');
const appNoDetail = appFull
  .replace("import IssueDetail from './pages/IssueDetail';\n", '')
  .replace('        <Route path="/issues/:id" element={<IssueDetail />} />\n', '');
const layout = read('client/src/components/Layout.jsx');
const cssBase = read('client/src/styles/global.css').split('.graphql-demo')[0];

const dashStub = `export default function Dashboard() {
  return <div className="page"><h2>Dashboard</h2><p>Statistics arrive in Stage 7.</p></div>;
}
`;
const usersStub = `export default function Users() {
  return <div className="page"><h2>Users</h2><p>User management arrives in Stage 8.</p></div>;
}
`;
const createStub = `export default function CreateIssue() {
  return <div className="page"><h2>Create Issue</h2><p>Form work begins in Stage 3.</p></div>;
}
`;

const issuesS1 = `import { Link } from 'react-router-dom';

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
`;

const issuesS2 = `import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

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
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
          </li>
        ))}
      </ul>
    </div>
  );
}
`;

const createS3 = `import { useState } from 'react';
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
`;

// Stage 01
write('stage-01/solution/client/package.json', clientPkg);
write('stage-01/solution/client/vite.config.js', "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()], server: { port: 5173 } });\n");
write('stage-01/solution/client/index.html', indexHtml);
write('stage-01/solution/client/src/main.jsx', mainJsx);
write('stage-01/solution/client/src/App.jsx', appNoDetail);
write('stage-01/solution/client/src/components/Layout.jsx', layout);
write('stage-01/solution/client/src/pages/Dashboard.jsx', dashStub);
write('stage-01/solution/client/src/pages/Users.jsx', usersStub);
write('stage-01/solution/client/src/pages/CreateIssue.jsx', createStub);
write('stage-01/solution/client/src/pages/Issues.jsx', issuesS1);
write('stage-01/solution/client/src/styles/global.css', cssBase);
write('stage-01/starter/client/src/App.jsx', 'export default function App(){return <p>Stage 1 starter: add SprintBoard shell.</p>};');

// Stage 02
write('stage-02/starter/client/src/pages/Issues.jsx', issuesS1);
write('stage-02/solution/client/src/pages/Issues.jsx', issuesS2);
copyTo('02', 'solution', 'client/src/components/StatusBadge.jsx');
copyTo('02', 'solution', 'client/src/components/PriorityBadge.jsx');
write('stage-02/solution/instructor-demo/ClassGreetingDemo.jsx', read('docs/demos/ClassGreetingDemo.jsx'));

// Stage 03
write('stage-03/starter/client/src/pages/CreateIssue.jsx', createStub);
write('stage-03/solution/client/src/pages/CreateIssue.jsx', createS3);

// Stage 04
write('stage-04/solution/demos/CounterDemo.jsx', read('docs/demos/CounterDemo.jsx'));
write('stage-04/solution/instructor-demo/serverless-hello-world.md', read('docs/demos/serverless-hello-world.md'));

// Stage 05
write('stage-05/solution/server/package.json', JSON.stringify({
  name: 'sprintboard-server', version: '1.0.0', private: true, main: 'src/server.js',
  scripts: { dev: 'node --watch src/server.js', start: 'node src/server.js' },
  dependencies: { cors: '^2.8.5', dotenv: '^16.4.7', express: '^4.21.2' },
}, null, 2));
write('stage-05/solution/server/src/server.js', `const createApp = require('./app');
const PORT = process.env.PORT || 5000;
const app = createApp();
app.listen(PORT, () => console.log('Stage 5 API on', PORT));
`);
let app5 = read('server/src/app.js').replace("const setupGraphQL = require('./graphql/setupGraphQL');\n", '').replace('  setupGraphQL(app);\n\n', '');
write('stage-05/solution/server/src/app.js', app5.replace('function createApp()', 'function createApp()').replace('module.exports = createApp;', 'module.exports = createApp;'));
write('stage-05/solution/server/src/routes/index.js', `const express = require('express');
const healthRoutes = require('./healthRoutes');
const router = express.Router();
router.use('/health', healthRoutes);
module.exports = router;
`);
write('stage-05/solution/server/src/controllers/healthController.js', `const { sendSuccess } = require('../utils/errors');
function getHealth(req, res) {
  sendSuccess(res, { service: 'ok', database: 'not_configured', ready: false });
}
module.exports = { getHealth };
`);
for (const f of ['server/src/middleware/requestLogger.js','server/src/middleware/errorHandler.js','server/src/utils/errors.js','server/src/routes/healthRoutes.js']) {
  copyTo('05', 'solution', f);
}
write('stage-05/solution/.env.example', 'PORT=5000\n');

// Stage 06 REST backend
const pkg6 = JSON.parse(read('server/package.json'));
['graphql','graphql-http','@graphql-tools/schema'].forEach((k) => delete pkg6.dependencies[k]);
write('stage-06/solution/server/package.json', JSON.stringify(pkg6, null, 2));
const serverCore = [
  'server/src/server.js','server/src/app.js','server/src/config/db.js',
  'server/src/models/User.js','server/src/models/Issue.js',
  'server/src/services/issueService.js','server/src/services/userService.js',
  'server/src/controllers/issueController.js','server/src/controllers/userController.js',
  'server/src/controllers/healthController.js','server/src/routes/index.js',
  'server/src/routes/issueRoutes.js','server/src/routes/userRoutes.js','server/src/routes/healthRoutes.js',
  'server/src/middleware/requireDatabase.js','server/src/middleware/validateObjectId.js',
  'server/src/middleware/requestLogger.js','server/src/middleware/errorHandler.js','server/src/utils/errors.js',
];
for (const f of serverCore) {
  let c = read(f);
  if (f.endsWith('app.js')) c = c.replace("const setupGraphQL = require('./graphql/setupGraphQL');\n", '').replace('  setupGraphQL(app);\n\n', '');
  write(`stage-06/solution/${f}`, c);
}
write('stage-06/solution/.env.example', read('.env.example'));

// Stage 07
copyTo('07', 'solution', 'client/src/services/api.js');
copyTo('07', 'solution', 'client/src/components/LoadingMessage.jsx');
copyTo('07', 'solution', 'client/src/components/ErrorMessage.jsx');
copyTo('07', 'solution', 'client/src/pages/Dashboard.jsx');
write('stage-07/solution/client/src/pages/Issues.jsx', issuesStage7);
write('stage-07/solution/client/vite.config.js', `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } } },
});
`);

// Stage 08
copyTo('08', 'solution', 'client/src/pages/CreateIssue.jsx');
copyTo('08', 'solution', 'client/src/pages/IssueDetail.jsx');
copyTo('08', 'solution', 'client/src/pages/Users.jsx');
write('stage-08/solution/client/src/App.jsx', appFull);
write('stage-08/solution/client/src/pages/Issues.jsx', stripGraphQLDemo(read('client/src/pages/Issues.jsx')));

// Stage 09 GraphQL queries only
write('stage-09/solution/server/package.json', read('server/package.json'));
for (const f of serverCore) write(`stage-09/solution/${f}`, read(f));
const gqlRoot = path.join(ROOT, 'server/src/graphql');
function copyGql(stage, transform) {
  function rec(dir, rel = '') {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const r = rel ? `${rel}/${ent.name}` : ent.name;
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) rec(p, r);
      else {
        let c = fs.readFileSync(p, 'utf8');
        if (transform) {
          if (r === 'schema/typeDefs.js') c = stripMutationTypeDefs(c);
          if (r === 'resolvers/index.js') c = stripMutationBlock(c);
        }
        write(`stage-${stage}/solution/server/src/graphql/${r}`, c);
      }
    }
  }
  rec(gqlRoot);
}
copyGql('09', true);

// Stage 10 GraphQL mutation + frontend demo
copyGql('10', false);
copyTo('10', 'solution', 'client/src/services/graphql.js');
copyTo('10', 'solution', 'client/src/components/GraphQLDemo.jsx');
write('stage-10/solution/client/src/pages/Issues.jsx', read('client/src/pages/Issues.jsx'));
write('stage-10/solution/client/vite.config.js', read('client/vite.config.js'));
for (const f of serverCore) write(`stage-10/solution/${f}`, read(f));

console.log('Generated stage solution/starter files.');
