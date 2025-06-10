const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: "Please enter a valid email"
    }
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
    validate: {
      validator: function (v) {
        return !validator.isEmpty(v);
      },
      message: "Password cannot be empty"
    }
  },
  role: {
    type: String,
    enum: ["student", "instructor", "admin"],
    default: "student"
  },
  profilePic: {
    type: String,
    default: "",
    validate: {
      validator: function (v) {
        return v === "" || validator.isURL(v);
      },
      message: "Profile picture must be a valid URL"
    }
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [300, "Bio must not exceed 300 characters"]
  },
  skills: {
    type: [String],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.every(skill => typeof skill === 'string' && skill.trim().length > 0);
      },
      message: "Each skill must be a non-empty string"
    }
  },
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
