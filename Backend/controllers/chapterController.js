const Chapter = require('../models/chapterModel');
const Course = require('../models/courseModel');

// Async error handler wrapper
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// GET all chapters (optionally filter by courseId)
exports.getAllChapters = asyncHandler(async (req, res) => {
  const filter = req.params.courseId ? { course: req.params.courseId } : {};
  const chapters = await Chapter.find(filter).sort({ order: 1 });

  res.status(200).json({
    status: 'success',
    results: chapters.length,
    data: { chapters }
  });
});

// GET a single chapter by ID
exports.getChapterById = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findById(req.params.id);

  if (!chapter) {
    return res.status(404).json({
      status: 'error',
      message: 'Chapter not found with that ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: { chapter }
  });
});

// CREATE a chapter (requires courseId in body or route param)
exports.createChapter = asyncHandler(async (req, res) => {
  const courseId = req.body.course || req.params.courseId;

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      status: 'error',
      message: 'No course found with the provided course ID',
    });
  }

  const chapter = await Chapter.create({ ...req.body, course: courseId });

  res.status(201).json({
    status: 'success',
    data: { chapter }
  });
});

// UPDATE a chapter
exports.updateChapter = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!chapter) {
    return res.status(404).json({
      status: 'error',
      message: 'Chapter not found with that ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: { chapter }
  });
});

// DELETE a chapter
exports.deleteChapter = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findByIdAndDelete(req.params.id);

  if (!chapter) {
    return res.status(404).json({
      status: 'error',
      message: 'Chapter not found with that ID',
    });
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
