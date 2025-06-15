const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: 'Please enter a valid email',
      },
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },

    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords do not match',
      },
    },

    passwordChangedAt: Date,

    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },

    profilePic: {
      type: String,
      default: '',
      validate: {
        validator: (v) => v === '' || validator.isURL(v),
        message: 'Profile picture must be a valid URL',
      },
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [300, 'Bio must not exceed 300 characters'],
    },

    skills: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) =>
          arr.every((skill) => typeof skill === 'string' && skill.trim().length > 0),
        message: 'Each skill must be a non-empty string',
      },
    },

    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
  },
  { timestamps: true }
);

// 🔐 Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  // Set passwordChangedAt to current time - 1s (for token safety)
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }

  next();
});

// ✅ Log user creation
userSchema.post('save', function (doc, next) {
  console.log(`✅ User created: ${doc.email} [${doc.role}]`);
  next();
});

// 🔍 Compare candidate password with hashed one
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// ⏱ Check if password was changed after the JWT was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }

  return false; // Not changed
};


userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; 

  return resetToken;
};



const User = mongoose.model('User', userSchema);
module.exports = User;
