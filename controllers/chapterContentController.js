const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const transporter = require('../config/email');
const { videoUpload } = require('../config/multer');
const APIFeatures = require('../utils/apiFeatures');

const Chapter = require('../models/chapterModel');
const Worksheet = require('../models/worksheetModel');
const Exercise = require('../models/exerciseModel');
const Assignment = require('../models/assignmentModel');
const CodeTask = require('../models/codeTaskModel');
const ProjectTask = require('../models/projectTaskModel');
const Quiz = require('../models/quizModel');
const PreviousExam = require('../models/previousExamModel');

// Async handler with improved error handling
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(err => {
    console.error(`[${new Date().toISOString()}] Error in ${req.method} ${req.path}:`, err);
    next(err);
  });
};

// Helper to get model by content type with validation
function getModelByType(type) {
  const contentTypes = {
    worksheet: Worksheet,
    exercise: Exercise,
    assignment: Assignment,
    codetask: CodeTask,
    projecttask: ProjectTask,
    quiz: Quiz,
    previousexam: PreviousExam
  };

  if (!contentTypes[type.toLowerCase()]) {
    throw new Error(`Invalid content type: ${type}`);
  }

  return contentTypes[type.toLowerCase()];
}

// Send notification email
const sendNotificationEmail = async (options) => {
  const mailOptions = {
    from: `E-Learning Platform <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
};

// -------- Chapter CRUD with Enhanced Features --------

// Get chapters by course
exports.getChaptersByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // Verify course exists (assuming Course model exists)
  const Course = require('../models/courseModel'); // Adjust path as needed
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      status: 'fail',
      message: 'Course not found'
    });
  }

  // Build query
  const features = new APIFeatures(
    Chapter.find({ course: courseId }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Execute query
  const chapters = await features.query;

  // Get total count for pagination
  const total = await Chapter.countDocuments({ course: courseId });

  res.status(200).json({
    status: 'success',
    results: chapters.length,
    total,
    page: features.page,
    limit: features.limit,
    data: chapters
  });
});

// Upload chapter video middleware with error handling
exports.uploadChapterVideo = (req, res, next) => {
  videoUpload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Video file too large. Maximum size is 100MB.' 
        });
      }
      return res.status(400).json({ 
        status: 'fail', 
        message: err.message 
      });
    }
    next();
  });
};

// Create Chapter with video processing and email notification
exports.createChapter = asyncHandler(async (req, res) => {
  const data = { ...req.body, course: req.params.courseId }; // Include courseId
  
  // Add video URL if uploaded
  if (req.file) {
    data.video = {
      url: req.file.path,
      publicId: req.file.filename,
      duration: req.file.duration,
      format: req.file.format,
      size: req.file.size
    };
  }

  const newChapter = await Chapter.create(data);

  // Send notification email (optional)
  try {
    await sendNotificationEmail({
      email: 'admin@example.com',
      subject: 'New Chapter Created',
      message: `<p>A new chapter "${newChapter.title}" has been created.</p>`
    });
  } catch (emailError) {
    console.error('Failed to send notification email:', emailError);
  }

  res.status(201).json({ 
    status: 'success', 
    data: newChapter,
    message: 'Chapter created successfully'
  });
});

// Get all chapters with advanced query features
exports.getAllChapters = asyncHandler(async (req, res) => {
  // Build query
  const features = new APIFeatures(Chapter.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Execute query
  const chapters = await features.query;

  // Get total count for pagination
  const total = await Chapter.countDocuments(features.filterObj);

  res.status(200).json({ 
    status: 'success',
    results: chapters.length,
    total,
    page: features.page,
    limit: features.limit,
    data: chapters 
  });
});

// Search chapters by title or description
exports.searchChapters = asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ 
      status: 'fail', 
      message: 'Please provide a search query' 
    });
  }

  const features = new APIFeatures(
    Chapter.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    }), 
    req.query
  )
    .sort()
    .paginate();

  const results = await features.query;
  const total = await Chapter.countDocuments(features.filterObj);

  res.status(200).json({
    status: 'success',
    results: results.length,
    total,
    data: results
  });
});

// Get chapter by ID with content counts
exports.getChapterById = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findById(req.params.id);
  
  if (!chapter) {
    return res.status(404).json({ 
      status: 'fail', 
      message: 'Chapter not found' 
    });
  }

  // Get content counts for this chapter
  const contentCounts = await Promise.all([
    Worksheet.countDocuments({ chapter: chapter._id }),
    Exercise.countDocuments({ chapter: chapter._id }),
    Assignment.countDocuments({ chapter: chapter._id }),
    CodeTask.countDocuments({ chapter: chapter._id }),
    ProjectTask.countDocuments({ chapter: chapter._id }),
    Quiz.countDocuments({ chapter: chapter._id }),
    PreviousExam.countDocuments({ chapter: chapter._id }),
  ]);

  const response = {
    ...chapter.toObject(),
    contentCounts: {
      worksheets: contentCounts[0],
      exercises: contentCounts[1],
      assignments: contentCounts[2],
      codeTasks: contentCounts[3],
      projectTasks: contentCounts[4],
      quizzes: contentCounts[5],
      previousExams: contentCounts[6],
    }
  };

  res.status(200).json({ 
    status: 'success', 
    data: response 
  });
});

// Update chapter with video handling
exports.updateChapter = [
  exports.uploadChapterVideo,
  asyncHandler(async (req, res) => {
    const chapter = await Chapter.findById(req.params.id);
    
    if (!chapter) {
      return res.status(404).json({ 
        status: 'fail', 
        message: 'Chapter not found' 
      });
    }

    const updateData = req.body;

    // Handle video update
    if (req.file) {
      // Delete old video from Cloudinary if exists
      if (chapter.video?.publicId) {
        try {
          await cloudinary.uploader.destroy(chapter.video.publicId, {
            resource_type: 'video'
          });
        } catch (err) {
          console.error('Error deleting old video:', err);
        }
      }

      updateData.video = {
        url: req.file.path,
        publicId: req.file.filename,
        duration: req.file.duration,
        format: req.file.format,
        size: req.file.size
      };
    }

    const updatedChapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
      status: 'success', 
      data: updatedChapter,
      message: 'Chapter updated successfully'
    });
  })
];

// Delete chapter with all associated content and videos
exports.deleteChapter = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findById(req.params.id);
  
  if (!chapter) {
    return res.status(404).json({ 
      status: 'fail', 
      message: 'Chapter not found' 
    });
  }

  // Delete associated video from Cloudinary
  if (chapter.video?.publicId) {
    try {
      await cloudinary.uploader.destroy(chapter.video.publicId, {
        resource_type: 'video'
      });
      
      // Delete the entire folder
      await cloudinary.api.delete_folder(`chapters/videos/${chapter._id}`);
    } catch (err) {
      console.error('Error deleting video:', err);
    }
  }

  // Delete all associated content
  await Promise.all([
    Worksheet.deleteMany({ chapter: chapter._id }),
    Exercise.deleteMany({ chapter: chapter._id }),
    Assignment.deleteMany({ chapter: chapter._id }),
    CodeTask.deleteMany({ chapter: chapter._id }),
    ProjectTask.deleteMany({ chapter: chapter._id }),
    Quiz.deleteMany({ chapter: chapter._id }),
    PreviousExam.deleteMany({ chapter: chapter._id }),
  ]);

  // Delete the chapter
  await Chapter.findByIdAndDelete(req.params.id);

  res.status(204).json({ 
    status: 'success', 
    data: null,
    message: 'Chapter and all associated content deleted successfully'
  });
});

// -------- Enhanced Content CRUD --------

// Create content with validation
exports.createContent = asyncHandler(async (req, res) => {
  const { chapterId, type } = req.params;
  const Model = getModelByType(type);
  
  // Verify chapter exists
  const chapter = await Chapter.findById(chapterId);
  if (!chapter) {
    return res.status(404).json({ 
      status: 'fail', 
      message: 'Chapter not found' 
    });
  }

  const data = { ...req.body, chapter: chapterId };
  const created = await Model.create(data);

  // Update chapter's content count
  await Chapter.findByIdAndUpdate(chapterId, { $inc: { contentCount: 1 } });

  res.status(201).json({ 
    status: 'success', 
    data: created,
    message: `${type} created successfully`
  });
});

// Get content with advanced querying
exports.getContentById = asyncHandler(async (req, res) => {
  const { id, type } = req.params;
  const Model = getModelByType(type);

  const item = await Model.findById(id).populate('chapter', 'title description');

  if (!item) {
    return res.status(404).json({ 
      status: 'fail', 
      message: `${type} not found` 
    });
  }

  res.status(200).json({ 
    status: 'success', 
    data: item 
  });
});

// Update content
exports.updateContent = asyncHandler(async (req, res) => {
  const { id, type } = req.params;
  const Model = getModelByType(type);

  const updated = await Model.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    return res.status(404).json({ 
      status: 'fail', 
      message: `${type} not found` 
    });
  }

  res.status(200).json({ 
    status: 'success', 
    data: updated,
    message: `${type} updated successfully`
  });
});

// Delete content
exports.deleteContent = asyncHandler(async (req, res) => {
  const { id, type } = req.params;
  const Model = getModelByType(type);

  const deleted = await Model.findByIdAndDelete(id);

  if (!deleted) {
    return res.status(404).json({ 
      status: 'fail', 
      message: `${type} not found` 
    });
  }

  // Update chapter's content count
  await Chapter.findByIdAndUpdate(deleted.chapter, { $inc: { contentCount: -1 } });

  res.status(204).json({ 
    status: 'success', 
    data: null,
    message: `${type} deleted successfully`
  });
});

// Get all content of a type with pagination and filtering
exports.getAllContentsByChapterAndType = asyncHandler(async (req, res) => {
  const { chapterId, type } = req.params;
  const Model = getModelByType(type);

  // Verify chapter exists
  const chapter = await Chapter.findById(chapterId);
  if (!chapter) {
    return res.status(404).json({ 
      status: 'fail', 
      message: 'Chapter not found' 
    });
  }

  const features = new APIFeatures(
    Model.find({ chapter: chapterId }), 
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const items = await features.query;
  const total = await Model.countDocuments({ chapter: chapterId });

  res.status(200).json({
    status: 'success',
    results: items.length,
    total,
    page: features.page,
    limit: features.limit,
    data: items
  });
});

// Get all content for a chapter with pagination
exports.getAllContentsByChapter = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Verify chapter exists
  const chapter = await Chapter.findById(chapterId);
  if (!chapter) {
    return res.status(404).json({ 
      status: 'fail', 
      message: 'Chapter not found' 
    });
  }

  // Get all content types with pagination
  const [worksheets, exercises, assignments, codeTasks, projectTasks, quizzes, previousExams] = await Promise.all([
    Worksheet.find({ chapter: chapterId })
      .skip((page - 1) * limit)
      .limit(limit),
    Exercise.find({ chapter: chapterId })
      .skip((page - 1) * limit)
      .limit(limit),
    Assignment.find({ chapter: chapterId })
      .skip((page - 1) * limit)
      .limit(limit),
    CodeTask.find({ chapter: chapterId })
      .skip((page - 1) * limit)
      .limit(limit),
    ProjectTask.find({ chapter: chapterId })
      .skip((page - 1) * limit)
      .limit(limit),
    Quiz.find({ chapter: chapterId })
      .skip((page - 1) * limit)
      .limit(limit),
    PreviousExam.find({ chapter: chapterId })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  // Get total counts for each content type
  const [worksheetsCount, exercisesCount, assignmentsCount, codeTasksCount, projectTasksCount, quizzesCount, previousExamsCount] = await Promise.all([
    Worksheet.countDocuments({ chapter: chapterId }),
    Exercise.countDocuments({ chapter: chapterId }),
    Assignment.countDocuments({ chapter: chapterId }),
    CodeTask.countDocuments({ chapter: chapterId }),
    ProjectTask.countDocuments({ chapter: chapterId }),
    Quiz.countDocuments({ chapter: chapterId }),
    PreviousExam.countDocuments({ chapter: chapterId }),
  ]);

  res.status(200).json({
    status: 'success',
    page: parseInt(page),
    limit: parseInt(limit),
    data: {
      worksheets: { data: worksheets, total: worksheetsCount },
      exercises: { data: exercises, total: exercisesCount },
      assignments: { data: assignments, total: assignmentsCount },
      codeTasks: { data: codeTasks, total: codeTasksCount },
      projectTasks: { data: projectTasks, total: projectTasksCount },
      quizzes: { data: quizzes, total: quizzesCount },
      previousExams: { data: previousExams, total: previousExamsCount },
    }
  });
});