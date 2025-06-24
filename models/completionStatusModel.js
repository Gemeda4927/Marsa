const mongoose = require('mongoose');

const completionStatusSchema = new mongoose.Schema(
  {
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Completion status must be linked to a chapter']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Completion status must belong to a user']
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Automatically set completedAt when isCompleted is true
completionStatusSchema.pre('save', function (next) {
  if (this.isCompleted && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('CompletionStatus', completionStatusSchema);
