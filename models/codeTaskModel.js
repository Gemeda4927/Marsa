const mongoose = require('mongoose');

const codeTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Code task must have a title'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Code task must have a description'],
      minlength: [10, 'Description must be at least 10 characters']
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Code task must belong to a chapter']
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    },
    starterCode: {
      type: String,
      default: ''
    },
    expectedOutput: {
      type: String,
      default: ''
    },
    tags: [String]
  },
  { timestamps: true }
);

module.exports = mongoose.model('CodeTask', codeTaskSchema);
