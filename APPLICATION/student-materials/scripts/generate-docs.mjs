import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STAGES = path.resolve(__dirname, '../stages');
const MAT = path.resolve(__dirname, '..');

const defs = [
  {
    id: 'stage-01', order: 1, title: 'Application shell, routing, and static issue list', durationMinutes: 60,
    objectives: ['Create Vite React shell with routes', 'Build Layout with navigation', 'Render static issue list'],
    prerequisites: ['HTML/CSS/JS', 'Node.js installed'],
    syllabus: ['React components', 'Issue Tracker example', 'composition', 'children'],
    deferred: 'REST API, badges, forms with validation, backend',
  },
  {
    id: 'stage-02', order: 2, title: 'Props, presentational components, and children', durationMinutes: 50,
    objectives: ['Extract StatusBadge and PriorityBadge', 'Pass props from Issues list', 'Explain Layout children'],
    prerequisites: ['Stage 1 complete (cumulative client)'],
    syllabus: ['props', 'children', 'stateless components'],
    deferred: 'API integration',
    demo: 'instructor-demo/ClassGreetingDemo.jsx',
  },
  {
    id: 'stage-03', order: 3, title: 'Controlled forms and client-side validation', durationMinutes: 55,
    objectives: ['Controlled Create Issue form', 'Field-level validation', 'Local submit preview'],
    prerequisites: ['Stage 2 cumulative client'],
    syllabus: ['form validation', 'event handling', 'state'],
    deferred: 'REST persistence',
  },
  {
    id: 'stage-04', order: 4, title: 'React state, events, and Counter exercise', durationMinutes: 40,
    objectives: ['Practice state updates', 'Async initialization pattern', 'Relate to SprintBoard forms'],
    prerequisites: ['Stage 3'],
    syllabus: ['state updates', 'async initialization', 'events'],
    deferred: 'Counter not mounted in main SprintBoard app',
    demo: 'demos/CounterDemo.jsx, instructor-demo/serverless-hello-world.md (lecture)',
  },
  {
    id: 'stage-05', order: 5, title: 'Express application, middleware, and health endpoint', durationMinutes: 65,
    objectives: ['Express app factory', 'JSON + logging middleware', 'GET /api/health'],
    prerequisites: ['HTTP/JSON basics'],
    syllabus: ['Express', 'middleware', 'REST fundamentals'],
    deferred: 'MongoDB (Stage 6)',
  },
  {
    id: 'stage-06', order: 6, title: 'Mongoose models, shared services, and REST CRUD', durationMinutes: 90,
    objectives: ['User/Issue models', 'issueService/userService', 'REST CRUD + validation'],
    prerequisites: ['Stage 5', 'MongoDB running', '.env MONGODB_URI'],
    syllabus: ['Mongoose', 'MERN persistence', 'REST CRUD lab'],
    deferred: 'GraphQL, advanced frontend',
  },
  {
    id: 'stage-07', order: 7, title: 'REST API client and data-driven Dashboard / Issues', durationMinutes: 75,
    objectives: ['api.js client', 'Loading/error states', 'Dashboard stats from API'],
    prerequisites: ['Stage 6 server + Stages 1–2 client UI files'],
    syllabus: ['fetch integration', 'async data loading'],
    deferred: 'GraphQL demo, full filters (Stage 8)',
  },
  {
    id: 'stage-08', order: 8, title: 'Users, issue workflows, filters, and assignment', durationMinutes: 90,
    objectives: ['Users CRUD UI', 'Issue create/edit/delete', 'Filters and assignee'],
    prerequisites: ['Stage 7 cumulative project'],
    syllabus: ['component communication', 'lifting state (partial)', 'validation'],
    deferred: 'GraphQL',
  },
  {
    id: 'stage-09', order: 9, title: 'GraphQL schema, queries, scalar, and introspection', durationMinutes: 75,
    objectives: ['GraphQL schema', 'issues/issue/users queries', 'DateTime scalar', 'introspection in dev'],
    prerequisites: ['Stage 6+ services', 'Stage 8 REST working'],
    syllabus: ['GraphQL schema', 'custom scalar', 'introspection', 'field selection'],
    deferred: 'createIssue mutation (Stage 10)',
  },
  {
    id: 'stage-10', order: 10, title: 'GraphQL mutation, frontend demo, and final verification', durationMinutes: 60,
    objectives: ['createIssue mutation', 'GraphQLDemo UI', 'REST vs GraphQL comparison', 'run npm test/lint/build'],
    prerequisites: ['Stage 9 GraphQL queries'],
    syllabus: ['mutations', 'query variables', 'error handling'],
    deferred: 'none (teaching scope complete)',
  },
];

function listFiles(stageId, kind) {
  const base = path.join(STAGES, stageId, kind);
  if (!fs.existsSync(base)) return [];
  const out = [];
  function walk(dir, rel = '') {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const r = rel ? `${rel}/${ent.name}` : ent.name;
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(p, r);
      else out.push(`${kind}/${r}`.replace(/\\/g, '/'));
    }
  }
  walk(base);
  return out.sort();
}

for (const d of defs) {
  const dir = `stages/${d.id}`;
  const stageJson = {
    id: d.id,
    order: d.order,
    title: d.title,
    durationMinutes: d.durationMinutes,
    learningObjectives: d.objectives,
    prerequisites: d.prerequisites,
    syllabusTopics: d.syllabus,
    paths: {
      readme: `${dir}/README.md`,
      verification: `${dir}/verification.md`,
      challenge: `${dir}/challenge.md`,
      starter: `${dir}/starter/`,
      solution: `${dir}/solution/`,
    },
    starterFiles: listFiles(d.id, 'starter'),
    solutionFiles: listFiles(d.id, 'solution'),
    instructorDemos: d.demo ? [d.demo] : [],
    deferredToNextStage: d.deferred,
    cumulativeProjectNote:
      'Apply each stage solution on top of prior stages unless this stage README says otherwise. This stage folder contains deltas only for most stages after Stage 1.',
  };
  fs.writeFileSync(path.join(STAGES, d.id, 'stage.json'), JSON.stringify(stageJson, null, 2));

  const readme = `# ${d.title}

## Learning objectives
${d.objectives.map((o) => `- ${o}`).join('\n')}

## Prerequisites
${d.prerequisites.map((p) => `- ${p}`).join('\n')}

## Starting state
You should already have the cumulative SprintBoard project from previous stages (see \`docs/STUDENT_CODING_STAGES.md\`). This stage folder contains **starter** and **solution** files for paths that change in this stage only.

## Coding instructions (order)
1. Read \`starter/\` files for this stage.
2. Implement the tasks below before peeking at \`solution/\`.
3. Copy solution files into your cumulative project tree matching paths like \`client/src/...\` or \`server/src/...\`.

## Files in this stage package
**Starter:** ${stageJson.starterFiles.length ? stageJson.starterFiles.join(', ') : '(see prior stage solution — no new starter files)'}
**Solution:** ${stageJson.solutionFiles.join(', ')}

## Commands
${d.order <= 4 ? '- `cd client && npm install && npm run dev` (frontend only)' : d.order === 5 ? '- `cd server && npm install && npm run dev` (no MongoDB required)' : '- Configure `.env` from `.env.example`, then `npm run dev` from instructor root or run server + client separately'}

## Expected visible behavior
See \`verification.md\`.

## Deferred to next stage
${d.deferred}

## Reference
Instructor reference implementation: repository root (unchanged). Compare your cumulative project with \`solution/\` paths listed in \`stage.json\`.
`;
  fs.writeFileSync(path.join(STAGES, d.id, 'README.md'), readme);

  fs.writeFileSync(
    path.join(STAGES, d.id, 'verification.md'),
    `# Verification — ${d.title}

${verifyText(d)}

## Checklist
${checklist(d).map((c) => `- [ ] ${c}`).join('\n')}
`
  );

  fs.writeFileSync(
    path.join(STAGES, d.id, 'challenge.md'),
    `# Optional challenge — ${d.title}

${challengeText(d)}
`
  );
}

function verifyText(d) {
  const m = {
    1: 'Navigate to `/issues` and see three static issues without starting the backend.',
    2: 'Each issue shows colored status and priority badges driven by props.',
    3: 'Submitting Create Issue with a short description shows a field error and does not call any API.',
    4: 'Counter demo increments/decrements/doubles/resets after async loading gate.',
    5: '`curl http://localhost:5000/api/health` returns `{ success: true, data: { service: "ok" } }`.',
    6: '`POST /api/issues` persists data; duplicate user email returns HTTP 409.',
    7: 'Issues and Dashboard load from `GET /api/issues`; loading and error states visible.',
    8: 'Create user, assign issue, filter list, edit/delete issue with confirmation.',
    9: 'GraphQL `issues { id title }` returns data; `__schema` works in development; no `createIssue` mutation yet.',
    10: 'GraphQL mutation creates issue; REST list refreshes; `npm test` in reference project passes when fully merged.',
  };
  return m[d.order] || 'See instructor README.';
}

function checklist(d) {
  const c = {
    1: ['`npm run dev` serves port 5173', 'Nav links work', 'Static issues visible', 'No fetch calls in Network tab'],
    2: ['StatusBadge renders Open/In Progress/Closed', 'PriorityBadge renders Low/Medium/High', 'Layout wraps pages via children'],
    3: ['Title required', 'Description min 10 chars', 'Success preview is local JSON only'],
    4: ['Counter demo runs in separate mini app', 'Students explain state vs props'],
    5: ['Health endpoint JSON shape matches REST convention', 'Request logger prints lines'],
    6: ['Server requires MONGODB_URI', 'GET/POST issues and users work', 'Invalid assignee rejected'],
    7: ['Vite proxy `/api` configured', 'Dashboard totals match issue count', 'No GraphQL requests'],
    8: ['All five routes functional', 'Filters combine', 'Assignee shown when set'],
    9: ['POST /graphql query only', 'DateTime on createdAt is ISO string', 'Mutation absent from schema'],
    10: ['GraphQLDemo toggles fields', 'Mutation uses variables object', 'Errors array shown in UI'],
  };
  return c[d.order] || [];
}

function challengeText(d) {
  const ch = {
    1: 'Add a fourth static issue and a footer note on the Dashboard stub.',
    2: 'Add a `RoleBadge` teaching-only component (not in reference app) for future user rows.',
    3: 'Disable submit button until the form is valid without showing errors prematurely.',
    4: 'Add a "triple" button to Counter demo using functional setState.',
    5: 'Add a teaching-only `POST /api/echo` route that returns parsed JSON (remove before Stage 6).',
    6: 'Add query validation test idea: invalid status filter returns 400.',
    7: 'Show relative created date instead of locale date on Issues table.',
    8: 'Sort issues by priority on the client after fetch.',
    9: 'Run introspection query listing all enum names.',
    10: 'Compare response payload size REST vs GraphQL with only id+title.',
  };
  return ch[d.order] || 'Extend the current stage feature with instructor approval.';
}

const manifest = {
  name: 'SprintBoard Student Materials',
  version: '1.0.0',
  description: 'Ten incremental coding stages for the SprintBoard workshop. Cumulative assembly required.',
  referenceRepositoryNote: 'Instructor reference app lives at repository root and is not modified by these packages.',
  stages: defs.map((d) => ({
    id: d.id,
    order: d.order,
    title: d.title,
    learningObjectives: d.objectives,
    prerequisites: d.prerequisites,
    durationMinutes: d.durationMinutes,
    syllabusTopics: d.syllabus,
    paths: {
      metadata: `stages/${d.id}/stage.json`,
      readme: `stages/${d.id}/README.md`,
      verification: `stages/${d.id}/verification.md`,
      challenge: `stages/${d.id}/challenge.md`,
      starter: `stages/${d.id}/starter/`,
      solution: `stages/${d.id}/solution/`,
    },
  })),
};

fs.writeFileSync(path.join(MAT, 'manifest.json'), JSON.stringify(manifest, null, 2));

fs.writeFileSync(
  path.join(MAT, 'README.md'),
  `# SprintBoard Student Materials

Packages for the future code delivery portal. **Do not replace the instructor reference app** — merge stage \`solution/\` files into a cumulative student project.

- [manifest.json](./manifest.json) — portal metadata
- [stages/](./stages/) — ten stage folders
- Build scripts (instructor only): \`scripts/build-stages.mjs\`, \`scripts/generate-docs.mjs\`

See [docs/STUDENT_CODING_STAGES.md](../docs/STUDENT_CODING_STAGES.md) for pedagogy and timetable.
`
);

console.log('Generated stage docs and manifest.json');
