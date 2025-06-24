const express = require('express');
const exerciseController = require('../controllers/exerciseController');

const router = express.Router();

router
  .route('/')
  .post(exerciseController.createExercise)
  .get(exerciseController.getAllExercises);

router
  .route('/:id')
  .get(exerciseController.getExercise)
  .patch(exerciseController.updateExercise)
  .delete(exerciseController.deleteExercise);

module.exports = router;
