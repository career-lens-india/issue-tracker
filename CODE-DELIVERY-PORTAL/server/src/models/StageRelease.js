const mongoose = require('mongoose');

const STATUSES = ['COMING_SOON', 'LIVE', 'COMPLETED'];

const stageReleaseSchema = new mongoose.Schema(
  {
    stageId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^stage-\d{2}$/,
    },
    order: { type: Number, required: true, min: 1, max: 10 },
    status: { type: String, enum: STATUSES, default: 'COMING_SOON' },
    lastAction: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StageRelease', stageReleaseSchema);
module.exports.STATUSES = STATUSES;
