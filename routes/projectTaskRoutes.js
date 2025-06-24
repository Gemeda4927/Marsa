const express = require('express');
const router = express.Router();
const controller = require('../controllers/projectTaskController');

router
  .route('/')
  .post(controller.createProjectTask)
  .get(controller.getAllProjectTasks);

router
  .route('/:id')
  .get(controller.getProjectTask)
  .patch(controller.updateProjectTask)
  .delete(controller.deleteProjectTask);

module.exports = router;
