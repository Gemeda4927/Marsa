const express = require('express');
const router = express.Router();
const controller = require('../controllers/resourceLinkController');

router
  .route('/')
  .post(controller.createResourceLink)
  .get(controller.getAllResourceLinks);

router
  .route('/:id')
  .get(controller.getResourceLink)
  .patch(controller.updateResourceLink)
  .delete(controller.deleteResourceLink);

module.exports = router;
