const mongoose = require('mongoose');

const previousExamSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Previous exam must have a title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Previous exam must have a description'],
      minlength: [10, 'Description must be at least 10 characters']
    },
    fileUrl: {
      type: String,
      required: [true, 'Please provide a file URL for the exam']
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Previous exam must be linked to a chapter']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PreviousExam', previousExamSchema);
