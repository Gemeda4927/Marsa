const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Course Routes
router
  .route('/')
  .get(courseController.getAllCourses)
  .post(courseController.createCourse);

router
  .route('/:id')
  .get(courseController.getCourseById)
  .put(courseController.updateCourse)
  .delete(courseController.deleteCourse);

module.exports = router;
