const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config');

console.log('Starting server...');
console.log('Environment:', config.nodeEnv);
console.log('MongoDB URI:', config.mongodbUri);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Routes
app.use('/api/reservations', require('./server/routes/reservations'));
app.use('/api/orders', require('./server/routes/orders'));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong!';
  res.status(statusCode).json({
    error: message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined
  });
});

// MongoDB connection with retry logic
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      retryWrites: true
    });
    console.log('Successfully connected to MongoDB!');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});