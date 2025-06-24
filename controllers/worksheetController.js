const Worksheet = require('../models/worksheetModel');
const mongoose = require('mongoose');

// Create a new Worksheet with questions
exports.createWorksheet = async (req, res) => {
  try {
    const { title, description, chapter, questions } = req.body;

    if (!title || !chapter) {
      return res.status(400).json({
        success: false,
        message: 'Title and chapter are required'
      });
    }

    // Calculate initial stats
    const stats = {
      totalQuestions: questions?.length || 0,
      completedQuestions: questions?.filter(q => q.completed).length || 0,
      accuracy: 0,
      averageTime: 0
    };

    const worksheet = await Worksheet.create({ 
      title, 
      description, 
      chapter, 
      questions: questions || [],
      stats
    });

    res.status(201).json({
      success: true,
      data: worksheet
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get all Worksheets with filtering and pagination
exports.getAllWorksheets = async (req, res) => {
  try {
    // 1) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 2) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    let query = Worksheet.find(JSON.parse(queryStr)).populate('chapter');

    // 3) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 4) Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 5) Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const worksheets = await query;

    res.status(200).json({
      success: true,
      results: worksheets.length,
      data: worksheets
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get a single Worksheet by ID with detailed questions
exports.getWorksheet = async (req, res) => {
  try {
    const worksheet = await Worksheet.findById(req.params.id)
      .populate('chapter')
      .populate('questions');

    if (!worksheet) {
      return res.status(404).json({
        success: false,
        message: 'Worksheet not found'
      });
    }

    res.status(200).json({
      success: true,
      data: worksheet
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Update a Worksheet (including question management)
exports.updateWorksheet = async (req, res) => {
  try {
    // Basic worksheet info update
    if (req.body.title || req.body.description) {
      const updatedWorksheet = await Worksheet.findByIdAndUpdate(
        req.params.id,
        { title: req.body.title, description: req.body.description },
        { new: true, runValidators: true }
      );

      if (!updatedWorksheet) {
        return res.status(404).json({
          success: false,
          message: 'Worksheet not found'
        });
      }
    }

    // Handle question updates
    if (req.body.questions) {
      await Worksheet.findByIdAndUpdate(
        req.params.id,
        { $set: { questions: req.body.questions } },
        { runValidators: true }
      );
    }

    // Get the updated worksheet
    const worksheet = await Worksheet.findById(req.params.id).populate('chapter');

    res.status(200).json({
      success: true,
      data: worksheet
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Delete a Worksheet
exports.deleteWorksheet = async (req, res) => {
  try {
    const deleted = await Worksheet.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Worksheet not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Worksheet deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Question-specific controllers
exports.addQuestion = async (req, res) => {
  try {
    const worksheet = await Worksheet.findByIdAndUpdate(
      req.params.id,
      { $push: { questions: req.body } },
      { new: true, runValidators: true }
    );

    if (!worksheet) {
      return res.status(404).json({
        success: false,
        message: 'Worksheet not found'
      });
    }

    res.status(200).json({
      success: true,
      data: worksheet
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const worksheet = await Worksheet.findOneAndUpdate(
      { _id: req.params.id, 'questions._id': questionId },
      { $set: { 'questions.$': req.body } },
      { new: true, runValidators: true }
    );

    if (!worksheet) {
      return res.status(404).json({
        success: false,
        message: 'Worksheet or question not found'
      });
    }

    res.status(200).json({
      success: true,
      data: worksheet
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const worksheet = await Worksheet.findByIdAndUpdate(
      req.params.id,
      { $pull: { questions: { _id: questionId } } },
      { new: true }
    );

    if (!worksheet) {
      return res.status(404).json({
        success: false,
        message: 'Worksheet not found'
      });
    }

    res.status(200).json({
      success: true,
      data: worksheet
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Toggle question bookmark status
exports.toggleBookmark = async (req, res) => {
  try {
    const { questionId } = req.params;
    const worksheet = await Worksheet.findOne({ _id: req.params.id, 'questions._id': questionId });

    if (!worksheet) {
      return res.status(404).json({
        success: false,
        message: 'Worksheet or question not found'
      });
    }

    const question = worksheet.questions.id(questionId);
    question.bookmarked = !question.bookmarked;

    await worksheet.save();

    res.status(200).json({
      success: true,
      data: worksheet
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Mark question as completed
exports.markQuestionCompleted = async (req, res) => {
  try {
    const { questionId } = req.params;
    const worksheet = await Worksheet.findOne({ _id: req.params.id, 'questions._id': questionId });

    if (!worksheet) {
      return res.status(404).json({
        success: false,
        message: 'Worksheet or question not found'
      });
    }

    const question = worksheet.questions.id(questionId);
    question.completed = true;

    await worksheet.save();

    res.status(200).json({
      success: true,
      data: worksheet
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get questions by type
exports.getQuestionsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const worksheet = await Worksheet.findById(req.params.id);

    if (!worksheet) {
      return res.status(404).json({
        success: false,
        message: 'Worksheet not found'
      });
    }

    const filteredQuestions = worksheet.questions.filter(q => q.type === type);

    res.status(200).json({
      success: true,
      results: filteredQuestions.length,
      data: filteredQuestions
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};