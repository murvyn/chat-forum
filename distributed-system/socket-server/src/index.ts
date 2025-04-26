import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { logger } from "./startup/logger";
import { connectDB } from "./startup/db";
import { prod } from "./startup/prod";
import { routes } from "./startup/routes";

const app = express();
const port = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Import event handlers
import handleConnection from "./events/connection";
import handleDisconnection from "./events/disconnection";

// Set up socket.io connection and disconnection handlers
io.on("connection", (socket) => handleConnection(socket, io));
socket.on("disconnect", () => handleDisconnection(socket.id, io));

// Start the server
httpServer.listen(port, () => {
  logger.info(`Socket.io server listening on port ${port}...`);
});

export default httpServer;