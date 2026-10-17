const mongoose = require('mongoose');

const STATUSES = ['Open', 'In Progress', 'Closed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'Open',
    },
    priority: {
      type: String,
      enum: PRIORITIES,
      default: 'Medium',
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Issue', issueSchema);
module.exports.STATUSES = STATUSES;
module.exports.PRIORITIES = PRIORITIES;
