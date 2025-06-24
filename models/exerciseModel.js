const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'An exercise must have a title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
      minlength: [5, 'Title must be at least 5 characters'],
    },
    content: {
      type: String,
      required: [true, 'Exercise content is required'],
      minlength: [10, 'Content must be at least 10 characters'],
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Exercise must belong to a chapter'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Exercise', exerciseSchema);
