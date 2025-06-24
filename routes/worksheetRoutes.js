const express = require('express');
const worksheetController = require('../controllers/worksheetController');

const router = express.Router();

// Routes for worksheets
router
  .route('/')
  .get(worksheetController.getAllWorksheets)
  .post(worksheetController.createWorksheet);

router
  .route('/:id')
  .get(worksheetController.getWorksheet)
  .patch(worksheetController.updateWorksheet)
  .delete(worksheetController.deleteWorksheet);

module.exports = router;
