import mongoose from "mongoose";
import { logger } from "./logger";
import { createClient } from "redis";
import "dotenv/config";

const db = process.env.MONGODB_URI;
const redisKey = process.env.REDIS_KEY;
const redisUrl = process.env.REDIS_URL;
const redisPort = process.env.REDIS_PORT;

// Environment variable checks
if (!db) {
  throw new Error("MONGODB_URI environment variable is not set");
}
if (!redisKey) {
  throw new Error("REDIS_KEY environment variable is not set");
}
if (!redisUrl) {
  throw new Error("REDIS_URL environment variable is not set");
}
if (!redisPort) {
  throw new Error("REDIS_PORT environment variable is not set");
}

// Create Redis client
const client = createClient({
  password: redisKey,
  socket: {
    host: redisUrl,
    port: parseInt(redisPort),
  },
});

// Redis connection event handling
client.on("error", (err) => {
  logger.error(`Error connecting to Redis: ${err}`);
});

client.on("connect", () => {
  logger.info("Connected to Redis...");
});

// MongoDB connection function
export const connectDB = async () => {
  try {
    await mongoose.connect(db);
    logger.info("Connected to MongoDB...");
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
};

// Redis client connection function
export const redisClient = async () => {
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
};
