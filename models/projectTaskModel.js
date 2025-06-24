const mongoose = require('mongoose');

const projectTaskSchema = new mongoose.Schema(
  {
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Project task must be linked to a chapter']
    },
    title: {
      type: String,
      required: [true, 'Project task must have a title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Project task must have a description'],
      trim: true
    },
    deadline: {
      type: Date
    },
    submissionLink: {
      type: String,
      validate: {
        validator: v => !v || /^https?:\/\/.+/.test(v),
        message: props => `${props.value} is not a valid URL!`
      }
    },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'reviewed'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ProjectTask', projectTaskSchema);
