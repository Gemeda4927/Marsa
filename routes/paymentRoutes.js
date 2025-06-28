const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.post(
  '/initialize/:courseId',
  paymentController.initializePayment
);

router.post(
  '/verify',
  express.json(),
  paymentController.verifyPayment
);

router.get(
  '/status/:txRef',
  paymentController.checkEnrollmentStatus
);

module.exports = router;