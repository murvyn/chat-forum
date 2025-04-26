import { Server } from "socket.io";
import { addUserToOnlineList, notifyOnlineUsers } from "./utils"; // Assuming these functions are defined in a utils file

const handleSocketConnection = (socket: any) => {
  console.log("A user connected", socket.id);
  const userId = socket.handshake.query.userId as string | undefined;

  if (userId) {
    addUserToOnlineList(userId, socket.id);
    notifyOnlineUsers();

    socket.on("disconnect", () => {
      handleDisconnect(userId, socket.id);
    });
  }
};

export default handleSocketConnection;