const StageRelease = require('../models/StageRelease');
const { sendError } = require('../utils/errors');

async function attachStageStatus(req, res, next) {
  const { stageId } = req.params;
  if (!/^stage-\d{2}$/.test(stageId)) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid stage id');
  }
  const release = await StageRelease.findOne({ stageId });
  if (!release) {
    return sendError(res, 404, 'NOT_FOUND', 'Stage not found');
  }
  req.stageStatus = release.status;
  req.stageId = stageId;
  return next();
}

function denyComingSoonDetail(req, res, next) {
  if (req.stageStatus === 'COMING_SOON') {
    return sendError(res, 403, 'STAGE_NOT_RELEASED', 'This stage is not yet available');
  }
  return next();
}

function denySolutionUnlessCompleted(req, res, next) {
  const filePath = req.params.filePath || req.params[0] || '';
  if (filePath.startsWith('solution/') || filePath.startsWith('solution\\')) {
    if (req.stageStatus !== 'COMPLETED') {
      return sendError(res, 403, 'SOLUTION_WITHHELD', 'Solution code is not available for this stage');
    }
  }
  return next();
}

module.exports = {
  attachStageStatus,
  denyComingSoonDetail,
  denySolutionUnlessCompleted,
};
