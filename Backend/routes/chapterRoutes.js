const express = require('express');
const router = express.Router({ mergeParams: true });
const chapterController = require('../controllers/chapterController');

router
  .route('/')
  .get(chapterController.getChaptersByCourse)
  .post(chapterController.createChapter);

router
  .route('/:id')
  .get(chapterController.getChapterById)
  .put(chapterController.updateChapter)
  .delete(chapterController.deleteChapter);

module.exports = router;
