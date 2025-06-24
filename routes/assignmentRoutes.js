const express = require('express');
const router = express.Router();
const controller = require('../controllers/assignmentController');

router
  .route('/')
  .post(controller.createAssignment)
  .get(controller.getAllAssignments);

router
  .route('/:id')
  .get(controller.getAssignment)
  .patch(controller.updateAssignment)
  .delete(controller.deleteAssignment);

module.exports = router;
