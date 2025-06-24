const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema(
  {
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Live session must be linked to a chapter']
    },
    title: {
      type: String,
      required: [true, 'Live session must have a title'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    sessionLink: {
      type: String,
      required: [true, 'Live session must have a link'],
      validate: {
        validator: v => /^(https?:\/\/)/.test(v),
        message: props => `${props.value} is not a valid URL!`
      }
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Live session must have a scheduled time']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('LiveSession', liveSessionSchema);
