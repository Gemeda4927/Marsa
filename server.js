// 🚀 server.js - Connects to MongoDB and starts the Express server
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

// 🌱 Load environment variables from .env file
dotenv.config();

// 🔌 Connect to MongoDB
const DB = process.env.MONGODB_URI; // Use the full URI from .env

mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Successfully connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Exit on connection failure
  });

// 🛠️ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎓 E-Learning API is live on port ${PORT} 📚`);
});