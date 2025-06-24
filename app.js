const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// ===== Load Environment Variables =====
require('dotenv').config();

// ===== Database Connection =====
// require('./config/database');

// ===== Import Mongoose Models =====
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
  './models/projectTaskModel'
];
models.forEach(model => require(model));

// ===== Route Imports =====
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
  { path: '/api/v1/project-tasks', router: require('./routes/projectTaskRoutes') }
];

// ===== Create Express App =====
const app = express();

// ===== Security Middleware =====
app.use(helmet());

// ===== Rate Limiting =====
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter);

// ===== Development Logging =====
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ===== Body Parsers =====
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ===== CORS Configuration =====
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// ===== Static Files =====
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== Swagger Documentation =====
app.use('/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'Learning Platform API Docs'
  })
);

// ===== API Routes =====
routes.forEach(route => {
  app.use(route.path, route.router);
});

// ===== Health Check Endpoint =====
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date()
  });
});

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    console.error('Error Stack:', err.stack);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation Error',
      errors: Object.values(err.errors).map(el => el.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'fail',
      message: `Invalid ${err.path}: ${err.value}`
    });
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;
