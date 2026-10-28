import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STAGES_ROOT = path.resolve(__dirname, '../stages');
const WORK = path.resolve(__dirname, '../.verify-build-work');

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyTree(src, dest) {
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name);
    const d = path.join(dest, ent.name);
    if (ent.isDirectory()) {
      copyTree(s, d);
    } else {
      copyFile(s, d);
    }
  }
}

function mergeStageSolution(projectDir, stageNum) {
  const sol = path.join(
    STAGES_ROOT,
    `stage-${String(stageNum).padStart(2, '0')}/solution`,
  );
  if (!fs.existsSync(sol)) return;
  copyTree(sol, projectDir);
}

function pkgHash(dir) {
  const p = path.join(dir, 'package.json');
  if (!fs.existsSync(p)) return null;
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

function npmInstall(dir, lastHash) {
  const h = pkgHash(dir);
  if (!h) return lastHash;
  const stamp = path.join(dir, 'node_modules', '.verify-stamp');
  if (lastHash === h && fs.existsSync(stamp)) return h;
  execSync('npm install --no-audit --no-fund', { cwd: dir, stdio: 'inherit' });
  fs.mkdirSync(path.dirname(stamp), { recursive: true });
  fs.writeFileSync(stamp, h);
  return h;
}

rmrf(WORK);
fs.mkdirSync(WORK, { recursive: true });

const projectDir = path.join(WORK, 'cumulative');
fs.mkdirSync(projectDir, { recursive: true });

let clientHash = null;
let serverHash = null;
const results = [];

for (let n = 1; n <= 10; n++) {
  const stageId = `stage-${String(n).padStart(2, '0')}`;
  mergeStageSolution(projectDir, n);

  const clientDir = path.join(projectDir, 'client');
  const serverDir = path.join(projectDir, 'server');
  const entry = { stage: n, client: null, server: null };

  if (fs.existsSync(clientDir)) {
    try {
      clientHash = npmInstall(clientDir, clientHash);
      execSync('npm run build', { cwd: clientDir, stdio: 'pipe' });
      entry.client = 'ok';
    } catch (err) {
      entry.client = `fail: ${(err.stderr || err.stdout || err.message).toString()}`.slice(0, 800);
    }
  } else {
    entry.client = 'skipped';
  }

  if (fs.existsSync(serverDir)) {
    try {
      serverHash = npmInstall(serverDir, serverHash);
      execSync('node -e "require(\'./src/app\')()"', { cwd: serverDir, stdio: 'pipe' });
      entry.server = 'ok';
    } catch (err) {
      entry.server = `fail: ${(err.stderr || err.stdout || err.message).toString()}`.slice(0, 800);
    }
  } else {
    entry.server = 'skipped';
  }

  results.push(entry);
  console.log(`${stageId}: client=${entry.client} server=${entry.server}`);
  if (entry.client?.startsWith('fail') || entry.server?.startsWith('fail')) {
    break;
  }
}

rmrf(WORK);
console.log(JSON.stringify(results, null, 2));

const failed = results.filter(
  (r) =>
    (r.client && r.client.startsWith('fail')) ||
    (r.server && r.server.startsWith('fail')),
);
process.exit(failed.length ? 1 : 0);
