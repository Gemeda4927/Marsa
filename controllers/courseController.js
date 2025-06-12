const Course = require('../models/courseModel');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

exports.getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find()
    .populate('instructor', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: courses.length,
    data: { courses }
  });
});

exports.getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name email')
    .populate('studentsEnrolled', 'name email');

  if (!course) {
    return res.status(404).json({
      status: 'error',
      message: 'Course not found with that ID'
    });
  }

  res.status(200).json({
    status: 'success',
    data: { course }
  });
});

exports.createCourse = asyncHandler(async (req, res) => {
  const { title, description, language, instructor, thumbnail, price, duration } = req.body;

  const newCourse = await Course.create({
    title,
    description,
    language,
    instructor,
    thumbnail,
    price: price || 0,
    duration: duration || 0
  });

  res.status(201).json({
    status: 'success',
    data: { course: newCourse }
  });
});

exports.updateCourse = asyncHandler(async (req, res) => {
  const updatedCourse = await Course.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!updatedCourse) {
    return res.status(404).json({
      status: 'error',
      message: 'Course not found with that ID'
    });
  }

  res.status(200).json({
    status: 'success',
    data: { course: updatedCourse }
  });
});

exports.deleteCourse = asyncHandler(async (req, res) => {
  const deletedCourse = await Course.findByIdAndDelete(req.params.id);

  if (!deletedCourse) {
    return res.status(404).json({
      status: 'error',
      message: 'Course not found with that ID'
    });
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.activateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { isPublished: true },
    { new: true, runValidators: true }
  );

  if (!course) {
    return res.status(404).json({
      status: 'error',
      message: 'Course not found with that ID'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Course published successfully',
    data: { course }
  });
});

exports.deactivateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { isPublished: false },
    { new: true, runValidators: true }
  );

  if (!course) {
    return res.status(404).json({
      status: 'error',
      message: 'Course not found with that ID'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Course unpublished successfully',
    data: { course }
  });
});
