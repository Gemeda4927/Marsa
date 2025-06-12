const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A chapter must have a title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
    },
    content: {
      type: String,
      required: [true, 'A chapter must have content'],
    },
    videoUrl: {
      type: String,
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+\.(mp4|webm|mov|mkv)?$/.test(v);
        },
        message: props => `${props.value} is not a valid video URL!`,
      },
    },
    order: {
      type: Number,
      default: 0,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Chapter must belong to a course'],
    },
    resources: [
      {
        name: String,
        url: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Query middleware to auto-populate course info (optional)
chapterSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'course',
    select: 'title language instructor',
  });
  next();
});

module.exports = mongoose.model('Chapter', chapterSchema);
