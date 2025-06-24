const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Question must have a type'],
    enum: ['MCQ', 'Short Answer', 'Problem Solving', 'Theory'],
    default: 'MCQ'
  },
  question: {
    type: String,
    required: [true, 'Question must have content'],
    minlength: [5, 'Question must be at least 5 characters']
  },
  options: {
    type: [String],
    required: function() { return this.type === 'MCQ'; }
  },
  correctAnswer: {
    type: Number,
    required: function() { return this.type === 'MCQ'; },
    validate: {
      validator: function(val) {
        return val >= 0 && val < this.options.length;
      },
      message: 'Correct answer must be a valid option index'
    }
  },
  difficulty: {
    type: String,
    required: [true, 'Question must have difficulty level'],
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  explanation: {
    type: String,
    required: [true, 'Question must have explanation']
  },
  solution: {
    type: String,
    required: function() { return this.type === 'Problem Solving'; }
  },
  tags: {
    type: [String],
    default: []
  },
  bookmarked: {
    type: Boolean,
    default: false
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const worksheetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Worksheet must have a title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Worksheet must belong to a chapter']
    },
    questions: [questionSchema],
    stats: {
      totalQuestions: {
        type: Number,
        default: 0
      },
      completedQuestions: {
        type: Number,
        default: 0
      },
      accuracy: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      averageTime: {
        type: Number, // in minutes
        default: 0
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Calculate progress percentage virtual field
worksheetSchema.virtual('progress').get(function() {
  if (this.stats.totalQuestions === 0) return 0;
  return (this.stats.completedQuestions / this.stats.totalQuestions) * 100;
});

// Update stats when questions are modified
worksheetSchema.pre('save', function(next) {
  this.stats.totalQuestions = this.questions.length;
  this.stats.completedQuestions = this.questions.filter(q => q.completed).length;
  
  // Calculate accuracy (for demo purposes - would need actual user data)
  if (this.stats.completedQuestions > 0) {
    const correctAnswers = this.questions.filter(q => 
      q.completed && q.type === 'MCQ' && q.correctAnswer !== undefined
    ).length;
    this.stats.accuracy = (correctAnswers / this.stats.completedQuestions) * 100;
  }
  
  next();
});

module.exports = mongoose.model('Worksheet', worksheetSchema);