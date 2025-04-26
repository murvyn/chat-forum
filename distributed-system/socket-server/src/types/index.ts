// This file exports types and interfaces used throughout the Socket.io server, such as user session types.

export interface UserSession {
  userId: string;
  socketId: string;
}

export interface GroupMessage {
  sender: string;
  courseId: string;
  chatId: string;
  text: string;
  timestamp: Date;
}

export interface DirectMessage {
  sender: string;
  recipientId: string;
  chatId: string;
  text: string;
  timestamp: Date;
}