// src/config/db.js
// MongoDB connection module using Mongoose.
<<<<<<< HEAD
// Handles initial connection, graceful failure, and reconnection events.

import dns from 'node:dns';
import mongoose from 'mongoose';
import logger from '../utils/logger.js';
=======
// Handles initial connection, graceful failure, and reconnect
import dns from "node:dns";
import mongoose from "mongoose";
import logger from "../utils/logger.js";
>>>>>>> e8d0900ced9bf7a4719054ff92c4de298e6e9b9c

// Configure DNS resolvers to bypass local ISP DNS SRV lookup failures on Windows
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Fallback to default system DNS if setServers is restricted
}

const MAX_RETRIES = Number(process.env.MONGO_MAX_RETRIES || 3);
const RETRY_DELAY_MS = Number(process.env.MONGO_RETRY_DELAY_MS || 5000);

const setDbStatus = (connected) => {
  globalThis.__dbConnected = connected;
};

/**
 * Establish a connection to MongoDB Atlas.
 * Returns true when connected, false when the database is unavailable.
 */
const connectDB = async (retryCount = 0) => {
  try {
    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4,
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`📦 Database: ${conn.connection.name}`);
    setDbStatus(true);

    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
      setDbStatus(false);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected. Attempting to reconnect...");
      setDbStatus(false);
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected successfully.");
      setDbStatus(true);
    });

    return true;
  } catch (error) {
    logger.error(
      `MongoDB connection failed (attempt ${retryCount + 1}/${MAX_RETRIES}): ${error.message}`,
    );

    if (retryCount < MAX_RETRIES - 1) {
      logger.warn(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(retryCount + 1);
    }

    logger.warn(
      "MongoDB is unavailable. Continuing without the database for now.",
    );
    setDbStatus(false);
    return false;
  }
};

<<<<<<< HEAD
export default connectDB;
=======
export default connectDB;
>>>>>>> e8d0900ced9bf7a4719054ff92c4de298e6e9b9c
