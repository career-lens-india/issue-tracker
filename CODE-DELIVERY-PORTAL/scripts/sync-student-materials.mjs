/**
 * Copies APPLICATION/student-materials into server/student-materials for Vercel
 * serverless bundles (includeFiles). Single source of truth stays in APPLICATION/.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORTAL_ROOT = path.resolve(__dirname, '..');
const SOURCE = path.resolve(PORTAL_ROOT, '../APPLICATION/student-materials');
const TARGET = path.resolve(PORTAL_ROOT, 'server/student-materials');

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name);
    const d = path.join(dest, name);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) {
      copyRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

if (!fs.existsSync(path.join(SOURCE, 'manifest.json'))) {
  console.error('[sync-student-materials] Source not found:', SOURCE);
  console.error('Expected monorepo layout: issue-tracker/APPLICATION/student-materials');
  process.exit(1);
}

if (fs.existsSync(TARGET)) {
  fs.rmSync(TARGET, { recursive: true, force: true });
}

copyRecursive(SOURCE, TARGET);
console.log('[sync-student-materials] Copied to', TARGET);
