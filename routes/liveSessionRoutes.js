const express = require('express');
const router = express.Router();
const controller = require('../controllers/liveSessionController');

router
  .route('/')
  .post(controller.createLiveSession)
  .get(controller.getAllLiveSessions);

router
  .route('/:id')
  .get(controller.getLiveSession)
  .patch(controller.updateLiveSession)
  .delete(controller.deleteLiveSession);

module.exports = router;
