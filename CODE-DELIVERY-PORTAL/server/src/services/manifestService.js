const fs = require('fs');
const path = require('path');
const { AppError } = require('../utils/errors');
const { getMaterialsRoot } = require('../config/env');

let cachedManifest = null;

function getManifestPath() {
  return path.join(getMaterialsRoot(), 'manifest.json');
}

function loadManifest() {
  if (cachedManifest) return cachedManifest;
  const manifestPath = getManifestPath();
  if (!fs.existsSync(manifestPath)) {
    throw new AppError(500, 'MANIFEST_MISSING', 'Student materials manifest not found');
  }
  const raw = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(raw);
  if (!Array.isArray(manifest.stages) || manifest.stages.length !== 10) {
    throw new AppError(500, 'MANIFEST_INVALID', 'Manifest must define exactly ten stages');
  }
  const orders = manifest.stages.map((s) => s.order).sort((a, b) => a - b);
  for (let i = 0; i < 10; i += 1) {
    if (orders[i] !== i + 1) {
      throw new AppError(500, 'MANIFEST_INVALID', 'Stage orders must be 1 through 10');
    }
  }
  cachedManifest = manifest;
  return manifest;
}

function clearManifestCache() {
  cachedManifest = null;
}

function getStageFromManifest(stageId) {
  const manifest = loadManifest();
  const stage = manifest.stages.find((s) => s.id === stageId);
  if (!stage) {
    throw new AppError(404, 'NOT_FOUND', 'Stage not found');
  }
  return stage;
}

function validateStageFiles(stageId) {
  const stage = getStageFromManifest(stageId);
  const root = getMaterialsRoot();
  const stageJsonPath = path.join(root, 'stages', stageId, 'stage.json');
  if (!fs.existsSync(stageJsonPath)) {
    return { ok: false, missing: [`stages/${stageId}/stage.json`] };
  }
  const stageJson = JSON.parse(fs.readFileSync(stageJsonPath, 'utf8'));
  if (stageJson.id !== stageId) {
    return { ok: false, missing: ['stage.json id mismatch'] };
  }
  return { ok: true, stage, stageJson };
}

module.exports = {
  loadManifest,
  clearManifestCache,
  getStageFromManifest,
  validateStageFiles,
  getMaterialsRoot,
};
