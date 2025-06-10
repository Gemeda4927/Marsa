const express = require('express');
const morgan = require('morgan');

// Route Imports
const courseRouter = require('./routes/courseRoutes');
const userRouter = require('./routes/userRoutes');

// Create Express app
const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // HTTP request logging

// Mount Routes
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/users', userRouter);

// // Handle Unmatched Routes
// app.all('*', (req, res, next) => {
//   const err = new Error(`Cannot find ${req.originalUrl} on this server!`);
//   err.status = 'fail';
//   err.statusCode = 404;
//   next(err);
// });

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err.stack);
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message || 'Something went wrong on the server!',
  });
});

module.exports = app;