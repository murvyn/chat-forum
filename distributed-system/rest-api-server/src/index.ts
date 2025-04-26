import express from "express";
import { json } from "body-parser";
import userRoutes from "./routes/userRoutes";
import { connectDB } from "./startup/db";
import { logger } from "./startup/logger";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(json());

// Database connection
connectDB();

// Routes
app.use("/api/users", userRoutes);

// Start server
app.listen(port, () => {
  logger.info(`REST API server is running on port ${port}...`);
});

export default app;