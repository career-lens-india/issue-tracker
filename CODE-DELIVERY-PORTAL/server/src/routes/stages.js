const express = require('express');
const { loadManifest } = require('../services/manifestService');
const { getReleaseMap } = require('../services/releaseService');
const { getPublicStageDetail, readTreeFile } = require('../services/contentService');
const { getStageFromManifest } = require('../services/manifestService');
const { sendSuccess, sendError } = require('../utils/errors');
const {
  attachStageStatus,
  denyComingSoonDetail,
  denySolutionUnlessCompleted,
} = require('../middleware/stageAccess');
const { isDbReady } = require('../config/db');
const { requireStudentAccess } = require('../middleware/studentAccess');

const router = express.Router();

router.use(requireStudentAccess);

function requireDb(req, res, next) {
  if (!isDbReady()) {
    return sendError(res, 503, 'DB_NOT_READY', 'Database is not connected');
  }
  return next();
}

router.get('/', requireDb, async (req, res, next) => {
  try {
    const manifest = loadManifest();
    const statusMap = await getReleaseMap();
    const stages = manifest.stages
      .map((s) => ({
        id: s.id,
        order: s.order,
        title: s.title,
        durationMinutes: s.durationMinutes,
        learningObjectives: s.learningObjectives,
        prerequisites: s.prerequisites,
        syllabusTopics: s.syllabusTopics,
        status: statusMap[s.id] || 'COMING_SOON',
      }))
      .filter((s) => s.status === 'LIVE' || s.status === 'COMPLETED');
    return sendSuccess(res, { stages });
  } catch (err) {
    return next(err);
  }
});

router.get(
  '/:stageId',
  requireDb,
  attachStageStatus,
  denyComingSoonDetail,
  async (req, res, next) => {
    try {
      const stageMeta = getStageFromManifest(req.stageId);
      const detail = getPublicStageDetail(stageMeta, null, req.stageStatus);
      return sendSuccess(res, { stage: detail });
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  '/:stageId/files/*',
  requireDb,
  attachStageStatus,
  denyComingSoonDetail,
  denySolutionUnlessCompleted,
  async (req, res, next) => {
    try {
      const filePath = req.params[0];
      if (!filePath) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'File path required');
      }
      const parts = filePath.replace(/\\/g, '/').split('/');
      const category = parts[0];
      const rest = parts.slice(1).join('/');
      const file = readTreeFile(req.stageId, category, `${category}/${rest}`);
      return sendSuccess(res, { file });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
