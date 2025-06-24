const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
      minlength: [10, 'Question must be at least 10 characters']
    },
    answer: {
      type: String,
      default: ''
    },
    author: {
      type: String,
      required: [true, 'Author name is required']
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Discussion must be linked to a chapter']
    },
    tags: {
      type: [String],
      default: []
    },
    resolved: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Discussion', discussionSchema);
