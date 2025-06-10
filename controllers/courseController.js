const Course = require('../models/courseModel');


const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// GET all courses
exports.getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().populate('instructor', 'name email');
  res.status(200).json({ status: 'success', data: { courses } });
});

// GET single course by ID
exports.getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('instructor', 'name email');
  if (!course) {
    return res.status(404).json({ status: 'error', message: 'Course not found' });
  }
  res.status(200).json({ status: 'success', data: { course } });
});

// CREATE a new course
exports.createCourse = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    language,
    region,
    level,
    instructor,
    thumbnail,
    price,
    duration,
    modules
  } = req.body;

  if (!title || !description || !instructor) {
    return res.status(400).json({ status: 'error', message: 'Title, description, and instructor are required' });
  }

  const newCourse = await Course.create({
    title,
    description,
    category,
    language,
    region,
    level,
    instructor,
    thumbnail,
    price,
    duration,
    modules
  });

  res.status(201).json({ status: 'success', data: { course: newCourse } });
});

// UPDATE a course
exports.updateCourse = asyncHandler(async (req, res) => {
  const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!updatedCourse) {
    return res.status(404).json({ status: 'error', message: 'Course not found' });
  }

  res.status(200).json({ status: 'success', data: { course: updatedCourse } });
});

// DELETE a course
exports.deleteCourse = asyncHandler(async (req, res) => {
  const deletedCourse = await Course.findByIdAndDelete(req.params.id);
  if (!deletedCourse) {
    return res.status(404).json({ status: 'error', message: 'Course not found' });
  }

  res.status(200).json({ status: 'success', message: 'Course deleted successfully' });
});
