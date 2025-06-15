// models/previousExamModel.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  answer: { type: String },
  type: {
    type: String,
    enum: ['MCQ', 'Short Answer', 'Essay', 'True/False'],
    default: 'Short Answer'
  },
  options: [String] // Only used if type is MCQ
});

const previousExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number, required: true },
  institution: { type: String },
  questions: [questionSchema],
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('PreviousExam', previousExamSchema);
