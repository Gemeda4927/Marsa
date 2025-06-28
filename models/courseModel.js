const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required for enrollment'],
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: props => `${props.value} is not a valid user ID!`
    }
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  },
  paymentReference: {
    type: String,
    default: null,
  },
  paymentDate: {
    type: Date,
    default: null
  }
}, { 
  _id: false,
  timestamps: true 
});

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
      validate: {
        validator: function(v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: props => `${props.value} is not a valid instructor ID!`
      }
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
    studentsEnrolled: {
      type: [enrollmentSchema],
      validate: {
        validator: function(enrollments) {
          // Check for duplicate user enrollments
          const userIds = enrollments.map(e => e.user.toString());
          return new Set(userIds).size === userIds.length;
        },
        message: 'A user cannot be enrolled multiple times in the same course'
      }
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate
courseSchema.virtual('chapters', {
  ref: 'Chapter',
  foreignField: 'course',
  localField: '_id',
});

courseSchema.virtual('enrollmentCount').get(function () {
  return this.studentsEnrolled?.length || 0;
});

// Static method to check if user is enrolled
courseSchema.statics.isUserEnrolled = async function(courseId, userId) {
  const course = await this.findOne({
    _id: courseId,
    'studentsEnrolled.user': userId
  });
  return !!course;
};

// Improved enrollment method with proper subdocument updates
courseSchema.methods.updateEnrollment = async function(userId, status = 'paid', txRef = null, session = null) {
  try {
    const enrollment = this.studentsEnrolled.find(
      enrollment => enrollment.user.toString() === userId.toString()
    );

    if (!enrollment) {
      // Add new enrollment
      this.studentsEnrolled.push({
        user: userId,
        paymentStatus: status,
        paymentReference: txRef,
        paymentDate: status === 'paid' ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      // Update existing enrollment fields directly
      enrollment.paymentStatus = status;
      enrollment.paymentReference = txRef;
      if (status === 'paid' && !enrollment.paymentDate) {
        enrollment.paymentDate = new Date();
      }
      enrollment.updatedAt = new Date();
    }

    const options = session ? { session } : {};
    await this.save(options);
    return this;
  } catch (error) {
    throw new Error(`Failed to update enrollment: ${error.message}`);
  }
};

// Pre-save hook to validate enrollments
courseSchema.pre('save', function(next) {
  if (this.studentsEnrolled && this.studentsEnrolled.length > 0) {
    const invalidEnrollments = this.studentsEnrolled.filter(
      e => !e.user || !mongoose.Types.ObjectId.isValid(e.user)
    );
    
    if (invalidEnrollments.length > 0) {
      const err = new Error(`Invalid user references in enrollments`);
      err.name = 'ValidationError';
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);
