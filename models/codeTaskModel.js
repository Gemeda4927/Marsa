const mongoose = require('mongoose');

const codeTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  sampleCode: { type: String },
  expectedOutput: { type: String },
  link: {
    type: String,
    validate: v => !v || /^https?:\/\/.+/.test(v),
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('CodeTask', codeTaskSchema);
