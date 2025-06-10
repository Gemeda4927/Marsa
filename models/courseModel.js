const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, trim: true }, // text, PDF link, or video URL
  duration: { type: Number, default: 0 }, // minutes
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  chapters: [chapterSchema],
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A course must have a title'],
    trim: true,
    maxlength: [100, 'Title must be less than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'A course must have a description'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['ICT', 'Agriculture', 'Civics', 'Language','Technology', 'Science', 'Business', 'Gadaa System', 'Culture'],
    default: 'ICT',
  },


  language: {
    type: String,
    enum: ['Afaan Oromoo', 'Amharic', 'English', 'Tigrigna', 'Somali'],
    default: 'Afaan Oromoo',
  },
  region: {
    type: String,
    enum: ['Oromia', 'Amhara', 'Addis Ababa', 'Tigray', 'SNNPR', 'Gambella', 'Somali'],
    default: 'Oromia',
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
  thumbnail: { type: String }, // image URL or base64 string
  price: { type: Number, default: 0 }, // free or paid
  duration: { type: Number, default: 0 }, // total hours
  modules: [moduleSchema],
  studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
