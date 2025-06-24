const mongoose = require('mongoose');

const worksheetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Worksheet must have a title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    content: {
      type: String,
      required: [true, 'Worksheet must have content'],
      minlength: [10, 'Content must be at least 10 characters']
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Worksheet must belong to a chapter']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Worksheet', worksheetSchema);
