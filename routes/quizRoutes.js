const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

router
  .route('/')
  .post(quizController.createQuiz)
  .get(quizController.getAllQuizzes);

router
  .route('/:id')
  .get(quizController.getQuiz)
  .patch(quizController.updateQuiz)
  .delete(quizController.deleteQuiz);

module.exports = router;
