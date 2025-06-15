const express = require('express');
const morgan = require('morgan');
const cors = require('cors'); // <-- ✅ Add this line

// Route Imports
const courseRouter = require('./routes/courseRoutes');
const userRouter = require('./routes/userRoutes');

// Create Express app
const app = express();

// Middleware
app.use(cors()); 
app.use(express.json()); 
app.use(morgan('dev')); 

// Mount Routes
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/users', userRouter);

// Optional: Handle unmatched routes
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
