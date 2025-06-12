const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authController = require('../controllers/authController');

router
  .route('/')
  .get(authController.protect, courseController.getAllCourses)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'instructor'),
    courseController.createCourse
  );

router
  .route('/:id')
  .get(authController.protect, courseController.getCourseById)
  .put(
    authController.protect,
    authController.restrictTo('admin', 'instructor'),
    courseController.updateCourse
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'instructor'),
    courseController.deleteCourse
  );

module.exports = router;
