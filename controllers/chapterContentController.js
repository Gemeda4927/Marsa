const Chapter = require('../models/chapterModel');
const Worksheet = require('../models/worksheetModel');
const Exercise = require('../models/exerciseModel');
const Assignment = require('../models/assignmentModel');
const CodeTask = require('../models/codeTaskModel');
const ProjectTask = require('../models/projectTaskModel');
const Quiz = require('../models/quizModel');
const PreviousExam = require('../models/previousExamModel');

const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all contents by chapterId
exports.getAllContentsByChapter = asyncHandler(async (req, res) => {
  const chapterId = req.params.chapterId;

  const [worksheets, exercises, assignments, codeTasks, projectTasks, quizzes, previousExams] = await Promise.all([
    Worksheet.find({ chapter: chapterId }),
    Exercise.find({ chapter: chapterId }),
    Assignment.find({ chapter: chapterId }),
    CodeTask.find({ chapter: chapterId }),
    ProjectTask.find({ chapter: chapterId }),
    Quiz.find({ chapter: chapterId }),
    PreviousExam.find({ chapter: chapterId }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      worksheets,
      exercises,
      assignments,
      codeTasks,
      projectTasks,
      quizzes,
      previousExams,
    },
  });
});

// Create a new content item of a specific type for a chapter
exports.createContent = asyncHandler(async (req, res) => {
  const { chapterId, type } = req.params;
  const data = req.body;

  data.chapter = chapterId;

  let Model;
  switch (type.toLowerCase()) {
    case 'worksheet':
      Model = Worksheet;
      break;
    case 'exercise':
      Model = Exercise;
      break;
    case 'assignment':
      Model = Assignment;
      break;
    case 'codetask':
      Model = CodeTask;
      break;
    case 'projecttask':
      Model = ProjectTask;
      break;
    case 'quiz':
      Model = Quiz;
      break;
    case 'previousexam':
      Model = PreviousExam;
      break;
    default:
      return res.status(400).json({ status: 'fail', message: 'Invalid content type' });
  }

  const newItem = await Model.create(data);

  res.status(201).json({ status: 'success', data: newItem });
});

// Get content item by id and type
exports.getContentById = asyncHandler(async (req, res) => {
  const { id, type } = req.params;

  let Model;
  switch (type.toLowerCase()) {
    case 'worksheet':
      Model = Worksheet;
      break;
    case 'exercise':
      Model = Exercise;
      break;
    case 'assignment':
      Model = Assignment;
      break;
    case 'codetask':
      Model = CodeTask;
      break;
    case 'projecttask':
      Model = ProjectTask;
      break;
    case 'quiz':
      Model = Quiz;
      break;
    case 'previousexam':
      Model = PreviousExam;
      break;
    default:
      return res.status(400).json({ status: 'fail', message: 'Invalid content type' });
  }

  const item = await Model.findById(id);
  if (!item) {
    return res.status(404).json({ status: 'fail', message: `${type} not found` });
  }

  res.status(200).json({ status: 'success', data: item });
});

// Update content item by id and type
exports.updateContent = asyncHandler(async (req, res) => {
  const { id, type } = req.params;

  let Model;
  switch (type.toLowerCase()) {
    case 'worksheet':
      Model = Worksheet;
      break;
    case 'exercise':
      Model = Exercise;
      break;
    case 'assignment':
      Model = Assignment;
      break;
    case 'codetask':
      Model = CodeTask;
      break;
    case 'projecttask':
      Model = ProjectTask;
      break;
    case 'quiz':
      Model = Quiz;
      break;
    case 'previousexam':
      Model = PreviousExam;
      break;
    default:
      return res.status(400).json({ status: 'fail', message: 'Invalid content type' });
  }

  const updated = await Model.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

  if (!updated) {
    return res.status(404).json({ status: 'fail', message: `${type} not found` });
  }

  res.status(200).json({ status: 'success', data: updated });
});

// Delete content item by id and type
exports.deleteContent = asyncHandler(async (req, res) => {
  const { id, type } = req.params;

  let Model;
  switch (type.toLowerCase()) {
    case 'worksheet':
      Model = Worksheet;
      break;
    case 'exercise':
      Model = Exercise;
      break;
    case 'assignment':
      Model = Assignment;
      break;
    case 'codetask':
      Model = CodeTask;
      break;
    case 'projecttask':
      Model = ProjectTask;
      break;
    case 'quiz':
      Model = Quiz;
      break;
    case 'previousexam':
      Model = PreviousExam;
      break;
    default:
      return res.status(400).json({ status: 'fail', message: 'Invalid content type' });
  }

  const deleted = await Model.findByIdAndDelete(id);

  if (!deleted) {
    return res.status(404).json({ status: 'fail', message: `${type} not found` });
  }

  res.status(204).json({ status: 'success', data: null });
});
