const express = require('express');
const router = express.Router();
const controller = require('../controllers/completionStatusController');

router
  .route('/')
  .post(controller.createCompletionStatus)
  .get(controller.getAllCompletionStatus);

router
  .route('/:id')
  .get(controller.getCompletionStatus)
  .patch(controller.updateCompletionStatus)
  .delete(controller.deleteCompletionStatus);

module.exports = router;
