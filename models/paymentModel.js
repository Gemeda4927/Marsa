const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Payment must belong to a user']
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Payment must be for a course']
    },
    amount: {
      type: Number,
      required: [true, 'Payment must have an amount'],
      min: [0, 'Amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'ETB',
      enum: ['ETB', 'USD'], // Add other currencies as needed
      required: true
    },
    paymentMethod: {
      type: String,
      default: 'chapa',
      enum: ['chapa', 'bank-transfer', 'manual'], // Payment methods supported
      required: true
    },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'success', 'failed', 'refunded', 'cancelled'],
      required: true
    },
    transactionReference: {
      type: String,
      required: [true, 'Payment must have a transaction reference'],
      unique: true
    },
    chapaResponse: {
      type: mongoose.Schema.Types.Mixed // Stores raw response from Chapa
    },
    receiptUrl: {
      type: String,
      validate: {
        validator: function(v) {
          return /^(https?:\/\/|\/)/.test(v);
        },
        message: props => `${props.value} is not a valid URL!`
      }
    },
    verifiedAt: {
      type: Date
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed // For any additional data
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for faster querying
paymentSchema.index({ user: 1 });
paymentSchema.index({ course: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionReference: 1 }, { unique: true });
paymentSchema.index({ createdAt: 1 });

// Virtual populate
paymentSchema.virtual('userPayments', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

paymentSchema.virtual('coursePayments', {
  ref: 'Course',
  localField: 'course',
  foreignField: '_id',
  justOne: true
});

// Pre-save hook to validate payment
paymentSchema.pre('save', async function(next) {
  // Ensure referenced user and course exist
  const userExists = await mongoose.model('User').exists({ _id: this.user });
  const courseExists = await mongoose.model('Course').exists({ _id: this.course });
  
  if (!userExists) {
    return next(new AppError('User does not exist', 400));
  }
  
  if (!courseExists) {
    return next(new AppError('Course does not exist', 400));
  }
  
  next();
});

// Static methods
paymentSchema.statics.findByReference = function(reference) {
  return this.findOne({ transactionReference: reference });
};

paymentSchema.statics.findUserPayments = function(userId) {
  return this.find({ user: userId }).sort('-createdAt');
};

paymentSchema.statics.findCoursePayments = function(courseId) {
  return this.find({ course: courseId }).sort('-createdAt');
};

// Instance methods
paymentSchema.methods.markAsSuccess = function(chapaResponse) {
  this.status = 'success';
  this.chapaResponse = chapaResponse;
  this.verifiedAt = new Date();
  return this.save();
};

paymentSchema.methods.markAsFailed = function(chapaResponse) {
  this.status = 'failed';
  this.chapaResponse = chapaResponse;
  this.verifiedAt = new Date();
  return this.save();
};

paymentSchema.methods.generateReceipt = function() {
  // This would be implemented based on your receipt generation logic
  this.receiptUrl = `/payment-receipts/${this.transactionReference}.pdf`;
  return this.save();
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;