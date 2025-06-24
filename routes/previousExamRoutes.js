const express = require('express');
const router = express.Router();
const controller = require('../controllers/previousExamController');

router
  .route('/')
  .post(controller.createPreviousExam)
  .get(controller.getAllPreviousExams);

router
  .route('/:id')
  .get(controller.getPreviousExam)
  .patch(controller.updatePreviousExam)
  .delete(controller.deletePreviousExam);

module.exports = router;
