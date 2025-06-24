const Course = require('../models/courseModel');
const cloudinary = require('../config/cloudinary');

// ===================== Helper: Upload Image to Cloudinary =====================
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'courses/thumbnails' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

// ===================== Create Course =====================
exports.createCourse = async (req, res) => {
  try {
    let thumbnailUrl = null;

    if (req.file) {
      thumbnailUrl = await uploadToCloudinary(req.file.buffer);
    }

    const newCourse = await Course.create({
      title: req.body.title,
      description: req.body.description,
      language: req.body.language,
      level: req.body.level,
      instructor: req.body.instructor,
      thumbnail: thumbnailUrl,
      price: req.body.price,
      duration: req.body.duration,
      isPublished: req.body.isPublished,
      paymentStatus: req.body.paymentStatus,
    });

    res.status(201).json({
      status: 'success',
      data: { course: newCourse },
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// ===================== Get All Courses =====================
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('instructor', 'name email')
      .populate({
        path: 'chapters',
        populate: [
          { path: 'note' },
          { path: 'worksheet' },
          { path: 'exercise' },
          { path: 'quiz' },
          { path: 'assignment' },
          { path: 'codetask' },
          { path: 'summary' },
          { path: 'learningoutcome' },
          { path: 'previousexam' },
          { path: 'discussion' },
          { path: 'resourcelink' },
          { path: 'completionstatus' },
          { path: 'livesession' },
          { path: 'projecttask' },
        ]
      });

    res.status(200).json({
      status: 'success',
      results: courses.length,
      data: { courses },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ===================== Get Single Course with Full Chapter Info =====================
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate({
        path: 'chapters',
        populate: [
          { path: 'note' },
          { path: 'worksheet' },
          { path: 'exercise' },
          { path: 'quiz' },
          { path: 'assignment' },
          { path: 'codetask' },
          { path: 'summary' },
          { path: 'learningoutcome' },
          { path: 'previousexam' },
          { path: 'discussion' },
          { path: 'resourcelink' },
          { path: 'completionstatus' },
          { path: 'livesession' },
          { path: 'projecttask' },
        ]
      });

    if (!course) {
      return res.status(404).json({ status: 'fail', message: 'Course not found' });
    }

    res.status(200).json({
      status: 'success',
      data: { course },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ===================== Update Course =====================
exports.updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const updateData = { ...req.body };

    if (req.file) {
      const thumbnailUrl = await uploadToCloudinary(req.file.buffer);
      updateData.thumbnail = thumbnailUrl;
    }

    const updatedCourse = await Course.findByIdAndUpdate(courseId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCourse) {
      return res.status(404).json({ status: 'fail', message: 'Course not found' });
    }

    res.status(200).json({
      status: 'success',
      data: { course: updatedCourse },
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// ===================== Delete Course =====================
exports.deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);

    if (!deletedCourse) {
      return res.status(404).json({ status: 'fail', message: 'Course not found' });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
