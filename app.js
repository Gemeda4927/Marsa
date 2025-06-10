// ⚙️ app.js - Sets up the Express application
const express = require('express');
const morgan = require('morgan');

// 🌐 Route Imports
const courseRouter = require('./routes/courseRoutes');
const userRouter = require('./routes/userRoutes');

// 🎯 Create the Express app
const app = express();

// 🧠 Middleware
app.use(express.json());           // Parses incoming JSON
app.use(morgan('dev'));            // Logs incoming requests for dev

// 📌 Validate and Mount Routes
if (typeof courseRouter !== 'function') {
  console.error('❌ courseRouter is not a valid router:', courseRouter);
  throw new Error('courseRouter export is invalid');
}
app.use('/api/v1/courses', courseRouter); // 🎓 Course endpoints
app.use('/api/v1/users', userRouter); // 🎓 Course endpoints

if (typeof userRouter !== 'function') {
  console.error('❌ userRouter is not a valid router:', userRouter);
  throw new Error('userRouter export is invalid');
}
app.use('/api/v1/users', userRouter);     // 👤 User endpoints

// ❌ Handle Unmatched Routes
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `❌ Cannot find ${req.originalUrl} on this server!`
  });
});

// 🛡️ Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('❌ Unexpected error:', err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong on the server!'
  });
});

module.exports = app;