const mongoose = require('mongoose');

const learningOutcomeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Learning outcome must have a title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Learning outcome must have a description'],
      minlength: [10, 'Description must be at least 10 characters']
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Learning outcome must be linked to a chapter']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('LearningOutcome', learningOutcomeSchema);
