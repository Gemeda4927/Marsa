// validations/validatePaymentStatus.js

const { VALID_PAYMENT_STATUSES } = require('../constants');

/**
 * Validates payment status if provided
 * Throws an error if invalid
 */
const validatePaymentStatus = (paymentStatus) => {
  if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
    const error = new Error(`Invalid payment status value. Allowed: ${VALID_PAYMENT_STATUSES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }
};

module.exports = validatePaymentStatus;
