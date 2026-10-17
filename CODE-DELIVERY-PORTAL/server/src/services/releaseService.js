const StageRelease = require('../models/StageRelease');
const { loadManifest } = require('./manifestService');
const { AppError } = require('../utils/errors');

async function seedStagesIfNeeded() {
  const manifest = loadManifest();
  for (const s of manifest.stages) {
    await StageRelease.updateOne(
      { stageId: s.id },
      {
        $setOnInsert: {
          stageId: s.id,
          order: s.order,
          status: 'COMING_SOON',
          lastAction: 'seed',
        },
      },
      { upsert: true }
    );
  }
}

async function getAllReleases() {
  return StageRelease.find().sort({ order: 1 });
}

async function getReleaseMap() {
  const rows = await getAllReleases();
  const map = {};
  rows.forEach((r) => {
    map[r.stageId] = r.status;
  });
  return map;
}

async function setPublishLive(stageId) {
  const manifest = loadManifest();
  const target = manifest.stages.find((s) => s.id === stageId);
  if (!target) throw new AppError(404, 'NOT_FOUND', 'Stage not found');

  const ops = manifest.stages.map((s) => {
    let status = 'COMING_SOON';
    if (s.order < target.order) status = 'COMPLETED';
    else if (s.order === target.order) status = 'LIVE';
    return {
      updateOne: {
        filter: { stageId: s.id },
        update: { $set: { status, lastAction: `publish_live:${stageId}` } },
      },
    };
  });
  await StageRelease.bulkWrite(ops);
}

async function setCompleted(stageId) {
  const existing = await StageRelease.findOne({ stageId });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Stage not found');
  await StageRelease.updateOne(
    { stageId },
    { $set: { status: 'COMPLETED', lastAction: `mark_completed:${stageId}` } }
  );
}

async function setComingSoon(stageId) {
  const manifest = loadManifest();
  const target = manifest.stages.find((s) => s.id === stageId);
  if (!target) throw new AppError(404, 'NOT_FOUND', 'Stage not found');

  await StageRelease.updateOne(
    { stageId },
    { $set: { status: 'COMING_SOON', lastAction: `coming_soon:${stageId}` } }
  );

  const liveCount = await StageRelease.countDocuments({ status: 'LIVE' });
  if (liveCount > 1) {
    throw new AppError(409, 'INVALID_STATE', 'Multiple LIVE stages detected');
  }
}

async function updateStageStatus(stageId, action) {
  if (!['publish_live', 'mark_completed', 'coming_soon'].includes(action)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid action');
  }
  if (action === 'publish_live') return setPublishLive(stageId);
  if (action === 'mark_completed') return setCompleted(stageId);
  return setComingSoon(stageId);
}

module.exports = {
  seedStagesIfNeeded,
  getAllReleases,
  getReleaseMap,
  updateStageStatus,
};
