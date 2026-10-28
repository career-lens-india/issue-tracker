const fs = require('fs');
const path = require('path');
const { AppError } = require('../utils/errors');
const { getMaterialsRoot, getStageFromManifest } = require('./manifestService');

const DOC_KEYS = ['readme', 'verification', 'challenge'];
const TREE_CATEGORIES = ['starter', 'solution'];

function stageBaseDir(stageId) {
  return path.join(getMaterialsRoot(), 'stages', stageId);
}

function assertCategory(category) {
  if (![...DOC_KEYS, ...TREE_CATEGORIES].includes(category)) {
    throw new AppError(400, 'INVALID_CATEGORY', 'Invalid content category');
  }
}

function safeResolveUnderStage(stageId, relativePath) {
  const base = path.resolve(stageBaseDir(stageId));
  const target = path.resolve(base, relativePath);
  const rel = path.relative(base, target);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new AppError(400, 'INVALID_PATH', 'Invalid file path');
  }
  return target;
}

function readDoc(stageId, docKey) {
  assertCategory(docKey);
  const stage = getStageFromManifest(stageId);
  const rel = stage.paths[docKey];
  if (!rel) throw new AppError(404, 'NOT_FOUND', 'Document not found');
  const filePath = path.resolve(getMaterialsRoot(), rel);
  const base = path.resolve(stageBaseDir(stageId));
  const relToBase = path.relative(base, filePath);
  if (relToBase.startsWith('..') || path.isAbsolute(relToBase)) {
    throw new AppError(400, 'INVALID_PATH', 'Invalid document path');
  }
  if (!fs.existsSync(filePath)) {
    throw new AppError(404, 'NOT_FOUND', 'Document not found');
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return { path: relToBase.replace(/\\/g, '/'), content };
}

function listTree(stageId, category) {
  assertCategory(category);
  if (!TREE_CATEGORIES.includes(category)) {
    throw new AppError(400, 'INVALID_CATEGORY', 'Not a file tree category');
  }
  const dir = safeResolveUnderStage(stageId, category);
  if (!fs.existsSync(dir)) return [];
  const files = [];
  function walk(current, prefix) {
    for (const name of fs.readdirSync(current)) {
      const full = path.join(current, name);
      const rel = prefix ? `${prefix}/${name}` : name;
      const stat = fs.lstatSync(full);
      if (stat.isSymbolicLink()) continue;
      if (stat.isDirectory()) walk(full, rel);
      else files.push(`${category}/${rel}`.replace(/\\/g, '/'));
    }
  }
  walk(dir, '');
  return files.sort();
}

function readTreeFile(stageId, category, fileRel) {
  assertCategory(category);
  if (!TREE_CATEGORIES.includes(category)) {
    throw new AppError(400, 'INVALID_CATEGORY', 'Not a file tree category');
  }
  if (!fileRel || fileRel.includes('..')) {
    throw new AppError(400, 'INVALID_PATH', 'Invalid file path');
  }
  const normalized = fileRel.replace(/^\/+/, '');
  if (!normalized.startsWith(`${category}/`)) {
    throw new AppError(400, 'INVALID_PATH', 'File must be under requested category');
  }
  const underCategory = normalized.slice(category.length + 1);
  const filePath = safeResolveUnderStage(stageId, path.join(category, underCategory));
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    throw new AppError(404, 'NOT_FOUND', 'File not found');
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return { path: normalized, content };
}

function readOptionalStageMarkdown(stageId, filename) {
  const filePath = safeResolveUnderStage(stageId, filename);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return null;
  }
  return fs.readFileSync(filePath, 'utf8');
}

function getPublicStageDetail(stageMeta, release, status) {
  const base = {
    id: stageMeta.id,
    order: stageMeta.order,
    title: stageMeta.title,
    durationMinutes: stageMeta.durationMinutes,
    learningObjectives: stageMeta.learningObjectives,
    prerequisites: stageMeta.prerequisites,
    syllabusTopics: stageMeta.syllabusTopics,
    status,
  };
  if (status === 'COMING_SOON') {
    return base;
  }
  const docs = {};
  for (const key of DOC_KEYS) {
    docs[key] = readDoc(stageMeta.id, key).content;
  }
  return {
    ...base,
    instructions: docs.readme,
    verification: docs.verification,
    challenge: docs.challenge,
    recapBeforeSolution: readOptionalStageMarkdown(stageMeta.id, 'recap-before-solution.md'),
    recapAfterSolution:
      status === 'COMPLETED'
        ? readOptionalStageMarkdown(stageMeta.id, 'recap-after-solution.md')
        : null,
    starterFiles: listTree(stageMeta.id, 'starter'),
    solutionFiles: status === 'COMPLETED' ? listTree(stageMeta.id, 'solution') : [],
  };
}

module.exports = {
  readDoc,
  listTree,
  readTreeFile,
  getPublicStageDetail,
  DOC_KEYS,
  TREE_CATEGORIES,
};
