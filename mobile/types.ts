export interface OnlineUsers {
  userId: string;
  socketId: string;
}
export interface LoginProps {
  indexNumber: string;
  password: string;
}

export interface ForgotPasswordProps {
  indexNumber: string;
}

export interface UserProps {
  firstName: string;
  lastName: string;
  email: string;
  role: "student" | "lecturer" | "HOD";
  department: { _id: string; name: string };
  courses: { _id: string; name: string }[];
  _id: string;
  photoUrl: string
}

export interface UploadResponse {
  uploadResult: {
    secure_url: string;
  };
  type: "text" | "document" | "audio" | "video" | "image";
}

export interface Message {
  _id?: string;
  text: string;
  sender: string;
  createdAt: Date;
  courseId?: string;
  error?: boolean;
  type: "text" | "document" | "audio" | "video" | "image";
  sending?: boolean;
  chatId: string;
}


export interface Notification {
  sender: string;
  chatId: string;
  isRead: boolean;
  date: Date;
  message: string
}

export interface User {
  id: number;
  avatar: string;
  messages: Message[];
  name: string;
}

export interface UserChat {
  _id: string;
  members: string[];
  messages: Message[];
  type: "direct" | "course" | "group";
  name?: string;
  courses: string[];
  owner?: string
}

export interface UserChatWithId {
  user?: UserProps;
  chatId?: string;
  latestMessage?: Message;
}
export interface UserGroupChatWithId {
  users?: UserProps[];
  chatId?: string;
  latestMessage?: Message;
  name?: string;
  courses?: string[];
  user?: UserProps;
  owner?: string
}
