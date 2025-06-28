class AppError extends Error {
  constructor(message, statusCode, errorType = 'operational', metadata = {}) {
    super(message);
    
    // Standard Error properties
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = errorType === 'operational';
    this.errorType = errorType;
    this.metadata = metadata;
    
    // Payment-specific enhancements
    this.isPaymentError = errorType === 'payment';
    this.retryUrl = metadata.retryUrl || null;
    this.paymentGateway = metadata.paymentGateway || null;
    this.transactionReference = metadata.transactionReference || null;
    
    // Capture stack trace (excluding constructor call from it)
    Error.captureStackTrace(this, this.constructor);
    
    // Add timestamp
    this.timestamp = new Date().toISOString();
    
    // Additional context for development
    if (process.env.NODE_ENV === 'development') {
      this.stackTrace = this.stack;
    }
  }

  // Static factory methods for common error types
  static badRequest(message, metadata) {
    return new AppError(message, 400, 'validation', metadata);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404);
  }

  static conflict(message = 'Conflict occurred') {
    return new AppError(message, 409);
  }

  // Payment-specific errors
  static paymentFailed(message, metadata = {}) {
    return new AppError(
      message || 'Payment processing failed',
      402, // Payment Required
      'payment',
      { ...metadata, isPaymentError: true }
    );
  }

  static paymentVerificationFailed(transactionReference, paymentGateway = 'chapa') {
    return new AppError(
      'Payment verification failed',
      422, // Unprocessable Entity
      'payment',
      { transactionReference, paymentGateway, isPaymentError: true }
    );
  }

  // Database errors
  static databaseError(error, metadata) {
    return new AppError(
      'Database operation failed',
      500,
      'database',
      { originalError: error, ...metadata }
    );
  }

  // Format error for API response
  toJSON() {
    const jsonResponse = {
      status: this.status,
      message: this.message,
      ...(this.statusCode && { statusCode: this.statusCode }),
      ...(this.timestamp && { timestamp: this.timestamp }),
      ...(this.errorType && { errorType: this.errorType }),
    };

    // Add payment-specific fields if applicable
    if (this.isPaymentError) {
      jsonResponse.paymentError = true;
      if (this.retryUrl) jsonResponse.retryUrl = this.retryUrl;
      if (this.paymentGateway) jsonResponse.paymentGateway = this.paymentGateway;
      if (this.transactionReference) jsonResponse.transactionReference = this.transactionReference;
    }

    // Include metadata if present
    if (Object.keys(this.metadata).length > 0) {
      jsonResponse.metadata = this.metadata;
    }

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development' && this.stackTrace) {
      jsonResponse.stackTrace = this.stackTrace;
    }

    return jsonResponse;
  }
}

module.exports = AppError;