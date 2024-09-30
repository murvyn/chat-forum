import { createLogger, transports, format } from "winston";
import { MongoDB } from "winston-mongodb";
import "dotenv/config";

const mongoDBUri = process.env.MONGODB_URI;

if (!mongoDBUri) {
  throw new Error("MONGODB_URI environment variable is not set");
}

export const logger = createLogger({
  level: "info", // Default log level
  format: format.combine(
    format.timestamp(), // Add timestamp
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`; // Custom format
    })
  ),
  transports: [
    new transports.Console({
      format: format.colorize(), // Colorize console output
    }),
    new transports.File({ filename: "logger.log" }),
    new MongoDB({
      db: mongoDBUri,
      level: "error",
      options: { useUnifiedTopology: true },
      format: format.json(), // Store logs in JSON format in MongoDB
    }),
  ],
  exceptionHandlers: [
    new transports.Console(),
    new transports.File({ filename: "exceptions.log" }),
  ],
  rejectionHandlers: [
    new transports.Console(),
    new transports.File({ filename: "exceptions.log" }),
  ],
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});
