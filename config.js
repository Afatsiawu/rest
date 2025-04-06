require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV || 'development'
};

// Validate required environment variables
if (!config.mongodbUri) {
  throw new Error('MONGODB_URI is required in environment variables');
}

module.exports = config; 