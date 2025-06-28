const axios = require('axios');
const Course = require('../models/courseModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

const CHAPA_API_URL = process.env.CHAPA_API_URL || 'https://api.chapa.co/v1/transaction/initialize';
// const CHAPA_VERIFY_URL = 'https://api.chapa.co/v1/transaction/verify/:tx_ref';
const CHAPA_VERIFY_URL = 'https://api.chapa.co/v1/transaction/verify';

const CHAPA_AUTH_KEY = process.env.CHAPA_SECRET_KEY;

// Helper functions
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

const amountsEqual = (a, b) => Math.abs(parseFloat(a) - parseFloat(b)) < 0.0001;

class PaymentController {
  /**
   * Initialize payment with Chapa
   */
  static async initializePayment(req, res, next) {
    try {
      const { courseId } = req.params;
      const { amount, userId } = req.body;

      // Validate required fields
      if (!courseId || !amount || !userId) {
        throw new AppError('Course ID, amount, and user ID are required', 400);
      }

      // Fetch and validate user
      const user = await User.findById(userId).select('email firstName lastName');
      if (!user) throw new AppError('User not found', 404);
      if (!user.email || !isValidEmail(user.email)) {
        throw new AppError('User email is invalid or missing', 400);
      }

      // Fetch and validate course
      const course = await Course.findById(courseId).select('title price studentsEnrolled isPublished');
      if (!course) throw new AppError('Course not found', 404);
      if (!course.isPublished) throw new AppError('Course is not published yet', 400);

      // Validate amount matches course price
      const coursePrice = parseFloat(course.price);
      if (!amountsEqual(amount, coursePrice)) {
        throw new AppError('Payment amount does not match course price', 400);
      }

      // Check if user already enrolled
      const alreadyEnrolled = await Course.isUserEnrolled(courseId, userId);
      if (alreadyEnrolled) {
        return res.status(400).json({
          status: 'fail',
          message: 'User is already enrolled in this course',
        });
      }

      // Generate unique transaction reference
      const txRef = `course-${courseId}-${Date.now()}-${user.id}`;

      // Build callback URL with multiple fallback options
      let callbackUrl;
      
      // 1. Use explicitly configured callback URL
      if (process.env.CHAPA_CALLBACK_URL && isValidUrl(process.env.CHAPA_CALLBACK_URL)) {
        callbackUrl = process.env.CHAPA_CALLBACK_URL;
      } 
      // 2. Construct from API_BASE_URL
      else if (process.env.API_BASE_URL && isValidUrl(process.env.API_BASE_URL)) {
        callbackUrl = `${process.env.API_BASE_URL}/payments/verify`;
      }
      // 3. Use request host (for development)
      else {
        const protocol = req.protocol || 'https';
        const host = req.get('host') || 'localhost:3000';
        callbackUrl = `${protocol}://${host}/api/v1/payments/verify`;
      }

      // Prepare payload for Chapa
      const requestData = {
        amount: amount.toString(),
        currency: 'ETB',
        email: user.email,
        first_name: user.firstName || 'User',
        last_name: user.lastName || 'Customer',
        tx_ref: txRef,
        customization: {
          title: 'Course Payment',
          description: `Payment for ${course.title} course`,
        },
        meta: {
          userId: user.id,
          courseId,
          userEmail: user.email,
        },
        // callback_url: callbackUrl,
        // return_url: callbackUrl, 
      };

      // Call Chapa initialize endpoint
      const response = await axios.post(CHAPA_API_URL, requestData, {
        headers: {
          Authorization: `Bearer ${CHAPA_AUTH_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      const checkoutUrl = response.data?.data?.checkout_url;
      if (!checkoutUrl) {
        throw new AppError('Failed to initialize payment with payment provider', 500);
      }

      return res.status(200).json({
        status: 'success',
        data: {
          paymentUrl: checkoutUrl,
          txRef,
          status: 'pending',
          courseId,
          amount,
        },
      });
    } catch (error) {
      if (error.response?.data) {
        return res.status(error.response.status || 400).json({
          status: 'error',
          message: `Payment initialization failed: ${error.response.data.message || 'Unknown error'}`,
          details: error.response.data,
        });
      }
      next(error);
    }
  }

/**
 * Verify payment with Chapa
 */
static async verifyPayment(req, res, next) {
  try {
    const { tx_ref: txRef } = req.body;

    if (!txRef) throw new AppError('Transaction reference (tx_ref) is required', 400);

    // Verify payment with Chapa
    const response = await axios.get(`${CHAPA_VERIFY_URL}/${txRef}`, {
      headers: { Authorization: `Bearer ${CHAPA_AUTH_KEY}` },
      timeout: 10000,
    });

    const paymentData = response.data?.data;
    if (!paymentData) throw new AppError('Invalid payment verification response', 500);

    const { userId, courseId } = paymentData.meta || {};
    if (!userId || !courseId) throw new AppError('Missing user or course information in payment metadata', 400);

    // Check payment status
    if (paymentData.status !== 'success') {
      return res.status(400).json({
        status: 'fail',
        message: 'Payment not successful',
        paymentStatus: paymentData.status,
      });
    }

    // Validate user exists
    const user = await User.findById(userId).select('_id');
    if (!user) throw new AppError('User not found', 404);

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) throw new AppError('Course not found', 404);

    // Check if user is already enrolled
    const isEnrolled = await Course.isUserEnrolled(courseId, userId);
    if (isEnrolled) {
      return res.status(200).json({
        status: 'success',
        message: 'User is already enrolled',
        data: {
          status: 'paid',
          courseId,
          userId,
          amount: paymentData.amount,
          paymentDate: paymentData.created_at,
          txRef,
        },
      });
    }

    // Update course enrollment with payment details
    await course.updateEnrollment(userId, 'paid', txRef);

    return res.status(200).json({
      status: 'success',
      data: {
        status: 'paid',
        courseId,
        userId,
        amount: paymentData.amount,
        paymentDate: paymentData.created_at,
        txRef,
      },
    });
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Payment verification timeout. Please check payment status later.';
    }
    next(error);
  }
}

  /**
   * Check enrollment status for a user and course
   */
  static async checkEnrollmentStatus(req, res, next) {
    try {
      const { courseId } = req.params;
      const { userId } = req.query;

      if (!courseId) throw new AppError('Course ID is required', 400);
      if (!userId) throw new AppError('User ID is required', 400);

      // Validate user exists
      const user = await User.findById(userId).select('_id');
      if (!user) throw new AppError('User not found', 404);

      // Validate course exists
      const course = await Course.findById(courseId).select('title studentsEnrolled');
      if (!course) throw new AppError('Course not found', 404);

      // Find the user's enrollment
      const enrollment = course.studentsEnrolled.find(
        e => e.user.toString() === userId.toString()
      );

      return res.status(200).json({
        status: 'success',
        data: {
          courseTitle: course.title,
          isEnrolled: !!enrollment,
          paymentStatus: enrollment?.paymentStatus || 'unpaid',
          paymentDate: enrollment?.paymentDate || null,
          txRef: enrollment?.txRef || null
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PaymentController;