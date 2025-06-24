const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A course must have a title'],
      trim: true,
      maxlength: [100, 'Title must be less than 100 characters'],
      minlength: [5, 'Title must be at least 5 characters'],
    },
    description: {
      type: String,
      required: [true, 'A course must have a description'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
    },
    language: {
      type: String,
      enum: ['Afaan Oromoo', 'Amharic', 'English', 'Tigrigna', 'Somali'],
      default: 'Afaan Oromoo',
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Course must have an instructor'],
    },
    thumbnail: {
      type: String,
      validate: {
        validator: function (v) {
          return /^(https?:\/\/|data:image)/.test(v);
        },
        message: props => `${props.value} is not a valid image URL or base64 string!`,
      },
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    duration: {
      type: Number,
      default: 0,
      min: [0, 'Duration cannot be negative'],
    },
    studentsEnrolled: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Virtual field to get chapters for this course
courseSchema.virtual('chapters', {
  ref: 'Chapter',
  foreignField: 'course',
  localField: '_id',
});

// ✅ Virtual property for enrollment count
courseSchema.virtual('enrollmentCount').get(function () {
  return this.studentsEnrolled?.length || 0;
});

// ✅ Pre-save hook
courseSchema.pre('save', function (next) {
  if (this.isModified('price') && this.price < 0) {
    throw new Error('Price cannot be negative');
  }
  console.log(`Saving course: ${this.title}`);
  next();
});

// ✅ Post-save hook
courseSchema.post('save', function (doc, next) {
  console.log(`Course ${doc.title} was saved successfully`);
  next();
});

module.exports = mongoose.model('Course', courseSchema);
