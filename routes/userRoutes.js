const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// 🔐 Auth Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// 🧑‍💼 User Self Routes
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updateMyPassword
);

router.patch(
  '/updateMe',
  authController.protect,
  authController.updateMe
);

router.delete(
  '/deleteMe',
  authController.protect,
  authController.deleteMe
);

// 👥 Admin User CRUD Routes (Requires Admin Role)
router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    userController.createUser
  )
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getAllUsers
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getUserById
  )
  .put(
    authController.protect,
    authController.restrictTo('admin'),
    userController.updateUser
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.deleteUser
  );

module.exports = router;
