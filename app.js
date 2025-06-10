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

// 📌 Mount Routes
app.use('/api/v1/courses', courseRouter); // 🎓 Course endpoints
app.use('/api/v1/users', userRouter);     // 👤 User endpoints

// ❌ Handle Unmatched Routes
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `❌ Cannot find ${req.originalUrl} on this server!`
  });
});

module.exports = app;
