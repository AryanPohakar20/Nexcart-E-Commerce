// src/config/db.js
// MongoDB connection module using Mongoose.
// Handles initial connection, graceful failure, and reconnection events.

import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

/**
 * Establish a connection to MongoDB Atlas.
 * Exits the process if the initial connection fails after MAX_RETRIES attempts.
 */
const connectDB = async (retryCount = 0) => {
  try {
    // Enforce strict query mode — unknown filter fields throw an error
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These are the recommended options for Mongoose 8+
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`📦 Database: ${conn.connection.name}`);

    // Handle post-connection events
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully.');
    });

  } catch (error) {
    logger.error(`MongoDB connection failed (attempt ${retryCount + 1}/${MAX_RETRIES}): ${error.message}`);

    if (retryCount < MAX_RETRIES - 1) {
      logger.warn(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(retryCount + 1);
    }

    logger.error('Could not connect to MongoDB after multiple attempts. Exiting.');
    process.exit(1);
  }
};

export default connectDB;
