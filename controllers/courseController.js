const Course = require('../models/courseModel');
const { buildFilter } = require('../utils/courseHelpers/helpers/filterHelper');
const validatePaymentStatus = require('../utils/courseHelpers/validations/validatePaymentStatus');
const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require('../utils/courseHelpers/constants/index');

// Wrap async functions for error handling middleware
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Builds a Mongoose query based on request parameters
const buildQuery = (req) => {
  if (req.query.mostPurchased || req.query.popular) {
    req.query.sort = '-studentsEnrolled';
    req.query.limit = req.query.limit || '10';
  }

  const filter = buildFilter(req.query);

  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  let query = Course.find(filter).populate('instructor', 'name email');

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  let limit = parseInt(req.query.limit, 10) || DEFAULT_PAGE_SIZE;
  limit = Math.min(limit, MAX_PAGE_SIZE);
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  return query;
};

const courseController = {
  getAllCourses: asyncHandler(async (req, res) => {
    const query = buildQuery(req);
    const courses = await query;

    res.status(200).json({
      status: 'success',
      results: courses.length,
      page: parseInt(req.query.page, 10) || 1,
      data: { courses },
    });
  }),

  getCourseById: asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate('studentsEnrolled', 'name email');

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { course },
    });
  }),

  createCourse: asyncHandler(async (req, res) => {
    const { paymentStatus, ...courseData } = req.body;

    validatePaymentStatus(paymentStatus);

    // Build full URL for thumbnail if file uploaded
    const thumbnailPath = req.file
      ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
      : null;

    const newCourse = await Course.create({
      ...courseData,
      price: courseData.price || 0,
      duration: courseData.duration || 0,
      paymentStatus: paymentStatus || 'unpaid',
      thumbnail: thumbnailPath,
    });

    res.status(201).json({
      status: 'success',
      data: { course: newCourse },
    });
  }),

  updateCourse: asyncHandler(async (req, res) => {
    if (req.body.paymentStatus) {
      validatePaymentStatus(req.body.paymentStatus);
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { course: updatedCourse },
    });
  }),

  deleteCourse: asyncHandler(async (req, res) => {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);

    if (!deletedCourse) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found with that ID',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }),

  activateCourse: asyncHandler(async (req, res) => {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isPublished: true },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Course published successfully',
      data: { course },
    });
  }),

  deactivateCourse: asyncHandler(async (req, res) => {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isPublished: false },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Course unpublished successfully',
      data: { course },
    });
  }),
};

module.exports = courseController;
