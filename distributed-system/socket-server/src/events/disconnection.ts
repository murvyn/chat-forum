import { Socket } from "socket.io";
import { onlineUsers } from "../index"; // Adjust the import based on your project structure

const handleDisconnect = (userId: string | undefined, socketId: string) => {
  if (userId) {
    onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
    console.log("User disconnected", socketId);
    // Emit updated online users list to all connected clients
    io.emit("getOnlineUsers", onlineUsers);
  }
};

export default handleDisconnect;