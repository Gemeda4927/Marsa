const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger'); 

// ========== Route Imports ==========
const courseRouter = require('./routes/courseRoutes');
const userRouter = require('./routes/userRoutes');
const chaptersRouter = require('./routes/chapterRoutes');
const noteRoutes = require('./routes/noteRoutes');
const worksheetRoutes = require('./routes/worksheetRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const quizRoutes = require('./routes/quizRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const codeTaskRoutes = require('./routes/codeTaskRoutes');
const summaryRoutes = require('./routes/summaryRoutes');
const learningOutcomeRoutes = require('./routes/learningOutcomeRoutes');
const previousExamRoutes = require('./routes/previousExamRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const resourceLinkRoutes = require('./routes/resourceLinkRoutes');
const completionStatusRoutes = require('./routes/completionStatusRoutes');
const liveSessionRoutes = require('./routes/liveSessionRoutes');
const projectTaskRoutes = require('./routes/projectTaskRoutes');

// ========== Create App ==========
const app = express();

// ========== 1. Middleware ==========
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ========== 2. Static Files ==========
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========== 3. Swagger UI ==========
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); 

// ========== 4. API Routes ==========
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/courses/:courseId/chapters', chaptersRouter);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/worksheets', worksheetRoutes);
app.use('/api/v1/exercises', exerciseRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/code-tasks', codeTaskRoutes);
app.use('/api/v1/summaries', summaryRoutes);
app.use('/api/v1/learning-outcomes', learningOutcomeRoutes);
app.use('/api/v1/previous-exams', previousExamRoutes);
app.use('/api/v1/discussions', discussionRoutes);
app.use('/api/v1/resource-links', resourceLinkRoutes);
app.use('/api/v1/completion-statuses', completionStatusRoutes);
app.use('/api/v1/live-sessions', liveSessionRoutes);
app.use('/api/v1/project-tasks', projectTaskRoutes);

// ========== 5. Global Error Handler ==========
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    console.error('Error Stack:', err.stack);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
});

module.exports = app;
