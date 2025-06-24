const express = require('express');
const router = express.Router();
const controller = require('../controllers/learningOutcomeController');

router
  .route('/')
  .post(controller.createLearningOutcome)
  .get(controller.getAllLearningOutcomes);

router
  .route('/:id')
  .get(controller.getLearningOutcome)
  .patch(controller.updateLearningOutcome)
  .delete(controller.deleteLearningOutcome);

module.exports = router;
