const express = require('express');
const router = express.Router({ mergeParams: true });
const chapterController = require('../controllers/chapterController');
const authController = require('../controllers/authController');

// Chapter Routes
router
  .route('/')
  .get(authController.protect, chapterController.getAllChapters)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'instructor'),
    chapterController.uploadChapterVideo,
    chapterController.createChapter
  );

router
  .route('/search')
  .get(authController.protect, chapterController.searchChapters);

router
  .route('/:id')
  .get(authController.protect, chapterController.getChapterById)
  .put(
    authController.protect,
    authController.restrictTo('admin', 'instructor'),
    chapterController.uploadChapterVideo,
    chapterController.updateChapter
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'instructor'),
    chapterController.deleteChapter
  );

router
  .route('/course/:courseId')
  .get(authController.protect, chapterController.getChaptersByCourse);

// Content Routes (nested under chapter)
router
  .route('/:chapterId/:type')
  .post(
    authController.protect,
    authController.restrictTo('admin', 'instructor'),
    chapterController.createContent
  )
  .get(authController.protect, chapterController.getAllContentsByChapterAndType);

router
  .route('/:chapterId/:type/:id')
  .get(authController.protect, chapterController.getContentById)
  .put(
    authController.protect,
    authController.restrictTo('admin', 'instructor'),
    chapterController.updateContent
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'instructor'),
    chapterController.deleteContent
  );

router
  .route('/:chapterId/content')
  .get(authController.protect, chapterController.getAllContentsByChapter);

module.exports = router;