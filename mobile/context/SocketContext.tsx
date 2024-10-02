import React from "react";
import { ReactNode,  createContext, useContext, useEffect, useState } from "react";
import {  io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { OnlineUsers } from "@/types";
import { baseUrl } from "@/utils/service";



interface SocketContextProps{
    socket: Socket | null;
    onlineUsers: OnlineUsers[];
}

export const SocketContext = createContext<SocketContextProps>({
    socket: null,
    onlineUsers: []
});

export const useSocket = () => {
    return useContext(SocketContext)
}

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUsers[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!socket && user) {
      if (!user?._id) {
        console.error("User ID is missing.");
        return;
      }
      const socket = io(baseUrl || '', {
        query: { userId: user?._id }, transports: ["websocket"],
      });
      setSocket(socket);
      // console.log(socket)

      socket?.on("connect_error", (error) => {
        console.error("Connection error:", error);
      });

     socket?.on("getNotifications", res =>{
      console.log(res)
     })

      return () => {
        socket.close();
        setSocket(null);
      };
    }
  }, [user]);

  useEffect(() => {
    if (socket === null) {
      return;
    }
    socket.on("getOnlineUsers", (users: OnlineUsers[]) => {
      setOnlineUsers(users);
    });
    // socket?.on("getMessage", (message) => {
    //   console.log(message)
      // if (chatId === message.chatId && message.sender === recipientId) {
      //   setMessages((prevMessages) =>
      //     prevMessages ? [...prevMessages, message] : [message]
      //   );
    // }
    // );

    return () => {
      socket.off("getOnlineUsers")
      // socket.off("getMessage")
    }
  }, [socket])

  const value: SocketContextProps = { onlineUsers, socket };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
