const Quiz = require('../models/quizModel');


// Create a new quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, questionCount, durationMinutes, difficulty, chapter } = req.body;

    const quiz = await Quiz.create({
      title,
      description,
      questionCount,
      durationMinutes,
      difficulty,
      chapter,
      isCompleted: false,
      score: 0,
      maxScore: 100,
    });

    res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Get all quizzes (with optional chapter filter)
exports.getAllQuizzes = async (req, res) => {
  try {
    const filter = {};
    if (req.query.chapter) {
      filter.chapter = req.query.chapter;
    }

    const quizzes = await Quiz.find(filter).populate('chapter');

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get a single quiz by ID
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('chapter');
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Update a quiz by ID
exports.updateQuiz = async (req, res) => {
  try {
    const { title, description, questionCount, durationMinutes, isCompleted, score, maxScore, difficulty, chapter } = req.body;

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        questionCount,
        durationMinutes,
        isCompleted,
        score,
        maxScore,
        difficulty,
        chapter,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedQuiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    res.status(200).json({
      success: true,
      data: updatedQuiz,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete a quiz by ID
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};