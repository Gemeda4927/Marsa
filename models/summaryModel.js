const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Summary must have a title'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Summary must have content'],
      minlength: [10, 'Content must be at least 10 characters']
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Summary must be linked to a chapter']
    },
    keyPoints: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Summary', summarySchema);
