const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz must have a title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      minlength: [5, 'Title must be at least 5 characters'],
    },
    description: {
      type: String,
      required: [true, 'Quiz must have a description'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    questionCount: {
      type: Number,
      required: [true, 'Quiz must specify the number of questions'],
      min: [1, 'Quiz must have at least 1 question'],
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Quiz must specify duration in minutes'],
      min: [1, 'Quiz duration must be at least 1 minute'],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    score: {
      type: Number,
      default: 0,
      min: [0, 'Score cannot be negative'],
    },
    maxScore: {
      type: Number,
      default: 100,
      min: [1, 'Maximum score must be at least 1'],
    },
    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: 'Difficulty must be easy, medium, or hard',
      },
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Quiz must belong to a chapter'],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Quiz', quizSchema);