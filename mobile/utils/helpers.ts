import { Notification, UserChatWithId, UserGroupChatWithId } from "@/types";
import moment from "moment";
import * as FileSystem from 'expo-file-system';

export const getInitials = (firstName: string, lastName: string) => {
  if (!firstName || !lastName) {
    return "";
  }
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
};

export const getFormattedTime = (createdAt: Date) => {
  const now = moment();
  const messageTime = moment(createdAt);
  const isRecent = now.diff(messageTime, "hours") < 24;

  return isRecent ? messageTime.format("h:m A") : messageTime.format("d/m/y");
};

export const unreadNotification = (notifications: Notification[]) => {
  return notifications?.filter((n) => n.isRead === false);
};

export const handleSearch = (
  search: string,
  chats?: UserChatWithId[],
  groupChat?: UserGroupChatWithId[]
) => {
  if (chats) {
    return chats?.filter((chat) => {
      const name = `${chat.user?.firstName.toLowerCase()} ${chat.user?.lastName.toLowerCase()}`;
      return name.includes(search.toLowerCase());
    });
  }
  return groupChat?.filter((chat) => {
    const {name} = chat
    return name?.toLowerCase().includes(search.toLowerCase());
  })
};

export function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export const convertBase64 = async (base64: string) =>  {
  const fileUri = FileSystem.cacheDirectory + "tempAudio.m4a"
  await FileSystem.writeAsStringAsync(fileUri, base64.split(',')[1], {encoding: FileSystem.EncodingType.Base64})

  return fileUri
}