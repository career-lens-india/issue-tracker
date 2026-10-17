const mongoose = require('mongoose');

const ROLES = ['Developer', 'Tester', 'Designer', 'Project Manager'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'Developer',
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

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
