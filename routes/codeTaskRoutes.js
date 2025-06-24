const express = require('express');
const router = express.Router();
const controller = require('../controllers/codeTaskController');

router
  .route('/')
  .post(controller.createCodeTask)
  .get(controller.getAllCodeTasks);

router
  .route('/:id')
  .get(controller.getCodeTask)
  .patch(controller.updateCodeTask)
  .delete(controller.deleteCodeTask);

module.exports = router;
