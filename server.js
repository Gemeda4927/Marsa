// 🚀 server.js - Connects to MongoDB and starts the Express server
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

// 🌱 Load environment variables from .env file
dotenv.config();

// 🔌 Connect to MongoDB
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Database'))
.catch((err) => console.error('❌ MongoDB connection failed:', err));

// 🛠️ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎓 E-Learning API running on port ${PORT} 📚`);
});
