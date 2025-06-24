const express = require('express');
const router = express.Router();
const controller = require('../controllers/discussionController');

router
  .route('/')
  .post(controller.createDiscussion)
  .get(controller.getAllDiscussions);

router
  .route('/:id')
  .get(controller.getDiscussion)
  .patch(controller.updateDiscussion)
  .delete(controller.deleteDiscussion);

module.exports = router;
