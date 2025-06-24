const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A chapter must have a title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      minlength: [5, 'Title must be at least 5 characters'],
    },
    content: {
      type: String,
      required: [true, 'A chapter must have content'],
      minlength: [10, 'Content must be at least 10 characters'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Chapter must belong to a course'],
    },
    order: {
      type: Number,
      default: 1,
      min: [1, 'Order must be at least 1'],
    },
    video: {
      type: String,
      validate: {
        validator: (v) => !v || /^(https?:\/\/|data:video)/.test(v),
        message: (props) => `${props.value} is not a valid video URL!`,
      },
    },
    audio: {
      type: String,
      validate: {
        validator: (v) => !v || /^(https?:\/\/|data:audio)/.test(v),
        message: (props) => `${props.value} is not a valid audio URL!`,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance optimization
chapterSchema.index({ course: 1, order: 1 }); 
chapterSchema.index({ title: 'text' });       

// Virtual populates for related documents
const virtualRelationships = [
  'Note',
  'Worksheet',
  'Exercise',
  'Quiz',
  'Assignment',
  'CodeTask',
  'Summary',
  'LearningOutcome',
  'PreviousExam',
  'Discussion',
  'ResourceLink',
  'CompletionStatus',
  'LiveSession',
  'ProjectTask',
];

virtualRelationships.forEach((model) => {
  chapterSchema.virtual(model.toLowerCase(), {
    ref: model,
    foreignField: 'chapter',
    localField: '_id',
    justOne: false,
  });
});

module.exports = mongoose.model('Chapter', chapterSchema);
