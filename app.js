const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const bodyParser = require('body-parser');

// ==================== INITIALIZATION ====================
require('dotenv').config();
const app = express();

// ==================== DATABASE CONFIG ====================
// require('./config/database');

// ==================== MODEL IMPORTS ====================
const models = [
  './models/courseModel',
  './models/chapterModel',
  './models/userModel',
  './models/noteModel',
  './models/worksheetModel',
  './models/exerciseModel',
  './models/quizModel',
  './models/assignmentModel',
  './models/codeTaskModel',
  './models/summaryModel',
  './models/learningOutcomeModel',
  './models/previousExamModel',
  './models/discussionModel',
  './models/resourceLinkModel',
  './models/completionStatusModel',
  './models/liveSessionModel',
  './models/projectTaskModel',
  './models/paymentModel',
];
models.forEach(model => require(model));

// ==================== ROUTE IMPORTS ====================
const routes = [
  { path: '/api/v1/courses', router: require('./routes/courseRoutes') },
  { path: '/api/v1/users', router: require('./routes/userRoutes') },
  { path: '/api/v1/courses/:courseId/chapters', router: require('./routes/chapterRoutes') },
  { path: '/api/v1/notes', router: require('./routes/noteRoutes') },
  { path: '/api/v1/worksheets', router: require('./routes/worksheetRoutes') },
  { path: '/api/v1/exercises', router: require('./routes/exerciseRoutes') },
  { path: '/api/v1/quizzes', router: require('./routes/quizRoutes') },
  { path: '/api/v1/assignments', router: require('./routes/assignmentRoutes') },
  { path: '/api/v1/code-tasks', router: require('./routes/codeTaskRoutes') },
  { path: '/api/v1/summaries', router: require('./routes/summaryRoutes') },
  { path: '/api/v1/learning-outcomes', router: require('./routes/learningOutcomeRoutes') },
  { path: '/api/v1/previous-exams', router: require('./routes/previousExamRoutes') },
  { path: '/api/v1/discussions', router: require('./routes/discussionRoutes') },
  { path: '/api/v1/resource-links', router: require('./routes/resourceLinkRoutes') },
  { path: '/api/v1/completion-statuses', router: require('./routes/completionStatusRoutes') },
  { path: '/api/v1/live-sessions', router: require('./routes/liveSessionRoutes') },
  { path: '/api/v1/project-tasks', router: require('./routes/projectTaskRoutes') },
  { path: '/api/v1/payments', router: require('./routes/paymentRoutes') },
];

// ==================== MIDDLEWARE SETUP ====================
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Improved payment webhook middleware
// Updated payment webhook middleware
app.post('/api/v1/payments/verify', 
  // First try to parse as raw JSON buffer
  bodyParser.raw({ type: 'application/json' }),
  // Then try to parse as regular JSON if raw parsing fails
  bodyParser.json(),
  (req, res, next) => {
    try {
      // Case 1: Already parsed JSON body (common with some providers)
      if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
        // Body is already parsed, use as-is
        next();
        return;
      }

      // Case 2: Raw buffer needs parsing
      if (Buffer.isBuffer(req.body)) {
        if (req.body.length === 0) {
          return res.status(400).json({
            status: 'error',
            message: 'Empty webhook payload received'
          });
        }

        const bodyString = req.body.toString('utf8');
        req.body = JSON.parse(bodyString);
        next();
        return;
      }

      // Case 3: Unexpected format
      return res.status(400).json({
        status: 'error',
        message: 'Unexpected webhook payload format',
        receivedType: typeof req.body
      });

    } catch (err) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to process webhook payload',
        details: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  }
);
// Rate limiting (exclude payment verification route)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  skip: (req) => req.path === '/api/v1/payments/verify',
});
app.use('/api', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.options('/api/v1/payments/verify', cors());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ==================== STATIC FILES ====================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/payment-receipts', express.static(path.join(__dirname, 'payment-receipts')));

// ==================== DOCUMENTATION ====================
app.use('/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'Learning Platform API Docs',
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
    },
  })
);

// ==================== ROUTE REGISTRATION ====================
routes.forEach(route => {
  app.use(route.path, route.router);
});

// ==================== HEALTH CHECK ====================
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date(),
    services: {
      database: 'connected',
      payment: 'active',
    },
  });
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.isPaymentError) {
    return res.status(err.statusCode).json({
      status: 'payment-error',
      message: err.message,
      code: err.code,
      retryUrl: err.retryUrl,
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Error Stack:', err.stack);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation Error',
      errors: Object.values(err.errors).map(el => el.message),
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'fail',
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;