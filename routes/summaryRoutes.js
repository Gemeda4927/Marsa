const express = require('express');
const router = express.Router();
const controller = require('../controllers/summaryController');

router
  .route('/')
  .post(controller.createSummary)
  .get(controller.getAllSummaries);

router
  .route('/:id')
  .get(controller.getSummary)
  .patch(controller.updateSummary)
  .delete(controller.deleteSummary);

module.exports = router;
