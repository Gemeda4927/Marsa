require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

// Validate environment variables
const requiredEnv = ['MONGODB_URI', 'PORT', 'JWT_SECRET', 'SESSION_SECRET'];
requiredEnv.forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env variable: ${key}`);
    process.exit(1);
  }
});

// Catch uncaught exceptions
process.on('uncaughtException', err => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI;

let server;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: process.env.NODE_ENV !== 'production',
      maxPoolSize: 10,
    });
    const { host, name } = mongoose.connection;
    console.log(`✅ Connected to MongoDB → ${host}/${name}`);
  } catch (err) {
    if (err.message.includes('timed out')) {
      console.error('❌ Connection timed out. Check your internet or MongoDB Atlas access settings.');
    } else {
      console.error('❌ MongoDB connection failed:', err.message);
    }
    process.exit(1);
  }
};

const startServer = async () => {
  await connectDB();
  server = app.listen(PORT, () => {
    console.log(`🚀 Server running → http://localhost:${PORT}`);
    console.log(`🌍 Environment → ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();

// Catch unhandled promise rejections
process.on('unhandledRejection', err => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  if (server) {
    server.close(() => process.exit(1));
    setTimeout(() => process.exit(1), 5000);
  } else {
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server?.close(() => {
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed.');
      process.exit(0);
    });
  });
});