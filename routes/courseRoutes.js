const express = require('express');
const multer = require('multer');
const path = require('path');

const courseController = require('../controllers/courseController');
const authController = require('../controllers/authController');

const router = express.Router();

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router
  .route('/')
  .get(authController.protect, courseController.getAllCourses)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'instructor'),
    upload.single('thumbnail'), // handle file upload
    courseController.createCourse
  );

router
  .route('/:id')
  .get(authController.protect, courseController.getCourseById)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'instructor'),
    courseController.updateCourse
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'instructor'),
    courseController.deleteCourse
  );

router
  .route('/:id/activate')
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'instructor'),
    courseController.activateCourse
  );

router
  .route('/:id/deactivate')
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'instructor'),
    courseController.deactivateCourse
  );

module.exports = router;
