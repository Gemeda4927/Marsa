const mongoose = require('mongoose');

const projectTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  objective: { type: String },
  details: { type: String },
  deadline: { type: Date },
  resources: [String],
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('ProjectTask', projectTaskSchema);
