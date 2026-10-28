import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STAGES_ROOT = path.resolve(__dirname, '../stages');

const NODE_BUILTINS = new Set([
  'assert',
  'buffer',
  'child_process',
  'cluster',
  'crypto',
  'dgram',
  'dns',
  'events',
  'fs',
  'http',
  'https',
  'module',
  'net',
  'os',
  'path',
  'process',
  'readline',
  'stream',
  'string_decoder',
  'timers',
  'tls',
  'tty',
  'url',
  'util',
  'v8',
  'vm',
  'zlib',
]);

const IMPORT_RE =
  /(?:import\s+(?:[\w*{}\s,]+\s+from\s+)?|export\s+.*?\sfrom\s+|require\s*\(\s*|import\s*\(\s*)['"]([^'"]+)['"]/g;

function listJsFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listJsFiles(p));
    else if (/\.(jsx?|mjs|cjs)$/.test(ent.name)) out.push(p);
  }
  return out;
}

function walkAllFiles(dir, prefix = '') {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${ent.name}` : ent.name;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkAllFiles(full, rel));
    else out.push({ rel, full });
  }
  return out;
}

function parseImports(content) {
  const imports = [];
  let m;
  const re = new RegExp(IMPORT_RE.source, 'g');
  while ((m = re.exec(content))) {
    imports.push({
      spec: m[1],
      line: content.slice(0, m.index).split(/\n/).length,
      raw: m[0],
    });
  }
  return imports;
}

function resolveRelative(fromFile, spec, fileSet) {
  const fromDir = path.dirname(fromFile).replace(/\\/g, '/');
  const base = path.posix.normalize(path.posix.join(fromDir, spec));
  const exts = ['', '.js', '.jsx', '/index.js', '/index.jsx'];
  for (const ext of exts) {
    const candidate = base + ext;
    if (fileSet.has(candidate)) return { ok: true, resolved: candidate };
  }
  return { ok: false, resolved: base };
}

function mergeStageSolution(cumulative, stageNum) {
  const stageDir = path.join(STAGES_ROOT, `stage-${String(stageNum).padStart(2, '0')}/solution`);
  if (!fs.existsSync(stageDir)) return;
  for (const { rel, full } of walkAllFiles(stageDir)) {
    cumulative.set(rel, fs.readFileSync(full, 'utf8'));
  }
}

function getPkgDeps(upToStage, cumulative) {
  const deps = new Set();
  const devDeps = new Set();
  for (let s = 1; s <= upToStage; s++) {
    for (const sub of ['client/package.json', 'server/package.json']) {
      const p = path.join(
        STAGES_ROOT,
        `stage-${String(s).padStart(2, '0')}/solution/${sub}`,
      );
      if (fs.existsSync(p)) {
        const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
        Object.keys(pkg.dependencies || {}).forEach((k) => deps.add(k));
        Object.keys(pkg.devDependencies || {}).forEach((k) => devDeps.add(k));
      }
    }
  }
  for (const [rel, content] of cumulative.entries()) {
    if (rel.endsWith('package.json')) {
      try {
        const pkg = JSON.parse(content);
        Object.keys(pkg.dependencies || {}).forEach((k) => deps.add(k));
        Object.keys(pkg.devDependencies || {}).forEach((k) => devDeps.add(k));
      } catch {
        /* ignore */
      }
    }
  }
  return { deps, devDeps };
}

function packageBase(spec) {
  if (spec.startsWith('@')) return spec.split('/').slice(0, 2).join('/');
  return spec.split('/')[0];
}

function isPackageListed(spec, deps, devDeps) {
  if (spec.startsWith('node:')) return true;
  const base = packageBase(spec);
  return deps.has(base) || devDeps.has(base);
}

function extractImportLine(content, lineNum) {
  return content.split(/\n/)[lineNum - 1]?.trim() ?? '';
}

const cumulative = new Map();
const issues = [];
const allImports = [];
const viteNotes = [];

for (let n = 1; n <= 10; n++) {
  const stageId = `stage-${String(n).padStart(2, '0')}`;
  const stagePath = path.join(STAGES_ROOT, stageId);
  const before = new Map(cumulative);

  mergeStageSolution(cumulative, n);
  const afterSolution = new Set(cumulative.keys());
  const pkgAfter = getPkgDeps(n, cumulative);

  for (const kind of ['starter', 'solution']) {
    const baseDir = path.join(stagePath, kind);
    if (!fs.existsSync(baseDir)) continue;

    let fileSet;
    let pkgInfo;
    let cumulativeForKind;

    if (kind === 'solution') {
      fileSet = afterSolution;
      pkgInfo = pkgAfter;
      cumulativeForKind = cumulative;
    } else {
      cumulativeForKind = new Map(before);
      for (const { rel, full } of walkAllFiles(baseDir)) {
        cumulativeForKind.set(rel, fs.readFileSync(full, 'utf8'));
      }
      fileSet = new Set(cumulativeForKind.keys());
      pkgInfo = getPkgDeps(n - 1, before);
    }

    for (const f of listJsFiles(baseDir)) {
      const projectRel = path.relative(baseDir, f).replace(/\\/g, '/');
      const content = fs.readFileSync(f, 'utf8');
      for (const imp of parseImports(content)) {
        const stmt = extractImportLine(content, imp.line);
        allImports.push({
          stage: n,
          kind,
          file: projectRel,
          line: imp.line,
          import: imp.spec,
          statement: stmt,
        });

        if (imp.spec.startsWith('.')) {
          const res = resolveRelative(projectRel, imp.spec, fileSet);
          if (!res.ok) {
            const inStageOnly = resolveRelative(
              projectRel,
              imp.spec,
              new Set(
                walkAllFiles(baseDir).map(({ rel }) => rel),
              ),
            ).ok;
            issues.push({
              stage: n,
              kind,
              file: projectRel,
              line: imp.line,
              importStatement: stmt,
              severity: kind === 'solution' ? 'high' : 'medium',
              classification:
                kind === 'solution' ? 'CONFIRMED' : 'POTENTIAL',
              explanation: inStageOnly
                ? `Relative target missing from cumulative merge set (resolves to ${res.resolved})`
                : `Relative target missing (resolves to ${res.resolved}); not present in stage folder either`,
              recommendedFix:
                kind === 'solution'
                  ? 'Add missing file in an earlier stage or this stage solution, or fix import path'
                  : 'Expected until student completes stage; ensure README mentions prerequisite files',
            });
          } else if (kind === 'starter') {
            const onlyInSolution = !resolveRelative(
              projectRel,
              imp.spec,
              new Set(before.keys()),
            ).ok;
            if (onlyInSolution) {
              issues.push({
                stage: n,
                kind,
                file: projectRel,
                line: imp.line,
                importStatement: stmt,
                severity: 'low',
                classification: 'POTENTIAL',
                explanation:
                  'Starter import resolves only after applying current or later stage solution files (not in prior cumulative alone)',
                recommendedFix:
                  'Document prerequisite merge steps, or provide stub in starter',
              });
            }
          }
        } else if (
          !imp.spec.startsWith('node:') &&
          !/^https?:/.test(imp.spec)
        ) {
          const pkgBase = packageBase(imp.spec);
          if (NODE_BUILTINS.has(pkgBase)) continue;
          if (!isPackageListed(imp.spec, pkgInfo.deps, pkgInfo.devDeps)) {
            issues.push({
              stage: n,
              kind,
              file: projectRel,
              line: imp.line,
              importStatement: stmt,
              severity: kind === 'solution' ? 'high' : 'medium',
              classification:
                kind === 'solution' ? 'CONFIRMED' : 'POTENTIAL',
              explanation: `Package "${packageBase(imp.spec)}" not listed in merged package.json through stage ${kind === 'starter' ? n - 1 : n}`,
              recommendedFix: `Add ${packageBase(imp.spec)} to client or server package.json in appropriate stage`,
            });
          }
        }
      }
    }
  }

  const vc = path.join(stagePath, 'solution/client/vite.config.js');
  if (fs.existsSync(vc)) {
    const content = fs.readFileSync(vc, 'utf8');
    if (/proxy\s*:/.test(content)) {
      const hasServer = [...afterSolution].some((k) => k.startsWith('server/'));
      const apiProxy = /['"]\/api['"]/.test(content);
      const gqlProxy = /['"]\/graphql['"]/.test(content);
      if (apiProxy && !hasServer) {
        viteNotes.push({
          stage: n,
          severity: 'medium',
          classification: 'POTENTIAL',
          explanation:
            'vite.config.js proxies /api but cumulative merge has no server/ yet',
          recommendedFix:
            'Document that proxy is inactive until Stage 5+ server merge, or defer proxy to Stage 7',
        });
      }
      if (gqlProxy) {
        const hasGql = [...afterSolution].some((k) =>
          k.includes('server/src/graphql'),
        );
        if (!hasGql) {
          viteNotes.push({
            stage: n,
            severity: 'high',
            classification: 'CONFIRMED',
            explanation:
              '/graphql proxy in vite.config but no server GraphQL after cumulative merge',
            recommendedFix: 'Add graphql proxy only in Stage 10 or when server graphql exists',
          });
        }
      }
      const portMatch = content.match(/target:\s*['"]http:\/\/localhost:(\d+)/);
      if (portMatch) {
        viteNotes.push({
          stage: n,
          file: 'client/vite.config.js',
          note: `proxy target port ${portMatch[1]} (expect server PORT from .env, default 5000)`,
        });
      }
    }
  }
}

console.log(
  JSON.stringify(
    { issueCount: issues.length, issues, viteNotes, importCount: allImports.length },
    null,
    2,
  ),
);
