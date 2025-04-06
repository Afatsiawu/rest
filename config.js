require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb+srv://afatsiawudavid134:qwerty5%4052@cluster0.8yvzgyp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  nodeEnv: process.env.NODE_ENV || 'development'
};

// Only throw error if we're in production and no MongoDB URI is set
if (config.nodeEnv === 'production' && !process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is required in environment variables for production');
}

module.exports = config; 