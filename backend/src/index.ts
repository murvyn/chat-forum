import { connectDB } from "./startup/db";
import { logger } from "./startup/logger";
import { prod } from "./startup/prod";
import { routes } from "./startup/routes";
import express from "express";
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import User from "./models/userModel";
import Chat from "./models/chatModel";
import { IChat } from "./types/types";

const app = express();
logger;
routes(app);
connectDB();
prod(app);
const port = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let onlineUsers: { userId: string; socketId: string }[] = [];

const Events = {
  SEND_MESSAGE: "sendMessage",
  GET_MESSAGE: "getMessage",
  NEW_DIRECT_CHAT: "new-direct-chat",
  NEW_CHAT: "newChat",
  START_CALL_DIRECT: "start_call_direct",
  END_CALL_DIRECT: "end_call_direct",
  SEND_GROUP_MESSAGE: "sendGroupMessage",
  GET_GROUP_MESSAGE: "getGroupMessage",
};

const handleSocketConnection = async (socket: any) => {
  console.log("A user connected", socket.id);
  const userId = socket.handshake.query.userId as string | undefined;

  if (userId) {
    addUserToOnlineList(userId, socket.id);

    const user = await User.findById(userId).populate("courses").exec();
    if (user) {
      joinUserRooms(socket, user);
      notifyOnlineUsers();
      await handleGroupChats(socket, userId);
    }

    socket.on(Events.SEND_MESSAGE, (message: any) =>
      handleSendMessage(message)
    );
    socket.on(Events.NEW_DIRECT_CHAT, (chat: any) => handleNewDirectChat(chat));
    socket.on(Events.START_CALL_DIRECT, (data: any) =>
      handleStartCallDirect(data, socket)
    );
    socket.on(Events.END_CALL_DIRECT, (data: any) =>
      handleEndCallDirect(data, socket)
    );
    socket.on(Events.SEND_GROUP_MESSAGE, (groupMessage: any) =>
      handleSendGroupMessage(groupMessage)
    );
  }

  socket.on("disconnect", () => handleDisconnect(userId, socket.id));
};

const addUserToOnlineList = (userId: string, socketId: string) => {
  if (!onlineUsers.some((user) => user.userId === userId)) {
    onlineUsers.push({ userId, socketId });
    console.log("online users", onlineUsers);
  }
};

const notifyOnlineUsers = () => {
  io.emit("getOnlineUsers", onlineUsers);
};

const joinUserRooms = (socket: any, user: any) => {
  const userCourses = user.courses.map((course: any) => course._id.toString());
  userCourses.forEach((courseId: any) => {
    if (!socket.rooms.has(courseId)) {
      socket.join(courseId);
      console.log(`User ${user._id} joined room ${courseId}`);
    }
  });
};

const handleGroupChats = async (socket: any, userId: string) => {
  const groupChats: IChat[] = await Chat.find({
    members: userId,
    type: "group",
  }).exec();
  groupChats.forEach((chat) => {
    const groupChatIds = chat.courses?.map((courseId) => courseId.toString());
    groupChatIds?.forEach((groupChatId) => {
      if (!socket.rooms.has(groupChatId)) {
        socket.join(groupChatId);
        console.log(`User ${userId} joined group chat room ${groupChatId}`);
      }
    });
  });
};

const handleSendMessage = (message: any) => {
  const recipientSocket = onlineUsers.find(
    (user) => user.userId === message.recipientId
  );
  if (recipientSocket) {
    io.to(recipientSocket.socketId).emit(Events.GET_MESSAGE, message);
    io.to(recipientSocket.socketId).emit("getNotifications", {
      sender: message.sender,
      isRead: false,
      date: new Date(),
      chatId: message.chatId,
      message: message.text,
    });
  } else {
    console.warn("Recipient not found:", message.recipientId);
  }
};

const handleNewDirectChat = (chat: any) => {
  const recipientSocket = onlineUsers.find(
    (user) => user.userId === chat.recipientId
  );
  if (recipientSocket) {
    io.to(recipientSocket.socketId).emit(Events.NEW_CHAT, chat);
    console.log("new chat");
  } else {
    console.warn("Recipient not found:", chat.recipientId);
  }
};

const handleStartCallDirect = (data: any, socket: any) => {
  const recipientSocket = onlineUsers.find(
    (user) => user.userId === data.receiver
  );
  if (recipientSocket) {
    socket.to(recipientSocket.socketId).emit("calling", data);
  }
};

const handleEndCallDirect = (data: any, socket: any) => {
  const recipientSocket = onlineUsers.find(
    (user) => user.userId === data.receiver
  );
  if (recipientSocket) {
    socket.to(recipientSocket.socketId).emit("ending", data);
  }
};

const handleSendGroupMessage = (groupMessage: any) => {
  console.log(groupMessage);
  io.to(groupMessage.courseId).emit(Events.GET_GROUP_MESSAGE, groupMessage);
  io.to(groupMessage.courseId).emit("getGroupNotifications", {
    sender: groupMessage.sender,
    isRead: false,
    date: new Date(),
    courseId: groupMessage.courseId,
    chatId: groupMessage.chatId,
    message: groupMessage.text,
  });
};

const handleDisconnect = (userId: string | undefined, socketId: string) => {
  console.log("userId", userId)
  if (userId) {
    onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
    io.emit("getOnlineUsers", onlineUsers);
    console.log("User disconnected", socketId, onlineUsers);
  }
};

io.on("connection", handleSocketConnection);

httpServer.listen(port, () => {
  logger.info(`Listening on port ${port}...`);
});

export default httpServer;
