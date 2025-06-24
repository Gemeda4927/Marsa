const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment must have a title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      minlength: [5, 'Title must be at least 5 characters']
    },
    content: {
      type: String,
      required: [true, 'Assignment must have content'],
      minlength: [10, 'Content must be at least 10 characters']
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Assignment must belong to a chapter']
    },
    dueDate: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
