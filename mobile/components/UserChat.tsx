import { View, Text, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useMemo } from "react";
import { Avatar } from "@rneui/themed";
import { useRouter } from "expo-router";
import LatestMessage from "./LatestMessage";
import { useChat } from "@/context/ChatContext";
import { unreadNotification } from "@/utils/helpers";
import moment from "moment";
import { Message } from "@/types";
import { useMutation } from "@tanstack/react-query";

const UserChat = ({
  sender,
  initials,
  chatId,
  userId,
  message,
  photo,
}: {
  sender: string;
  initials: string;
  chatId: string;
  userId: string;
  message: Message | null;
  photo: string;
}) => {
  const {
    setChatId,
    setRecipientId,
    notifications,
    markAsRead,
    setMessages,
    getMessages,
    setMessageLoading,
  } = useChat();
  const router = useRouter();

  const chatsNotifications = useMemo(
    () => unreadNotification(notifications)?.filter((n) => n.chatId === chatId),
    [notifications, chatId]
  );

  const now = moment();
  const messageTime = moment(message?.createdAt);
  const isRecent = now.diff(messageTime, "hours") < 24;

  const messagesMutation = useMutation({
    mutationFn: (id: string) => getMessages(id!),
    onSuccess: (data) => {
      setMessages(data);
    },
    onError: (error) => {
      console.log("Error fetching messages:", error);
      Alert.alert("Error", "Unable to fetch messages. Please try again.");
    },
  });

  useEffect(() => {
    setMessageLoading(messagesMutation.isPending);
  }, [messagesMutation.isPending]);

  const handlePress = (id: string) => {
    setRecipientId(userId);
    setChatId(id);
    messagesMutation.mutate(id);
    if (chatsNotifications) {
      markAsRead(chatId as string, notifications);
    }
    router.push(`/direct-messages/${id}`);
  };

  const isCurrentUser = message?.sender === userId;
  return (
    <TouchableOpacity
      onPress={() => handlePress(chatId)}
      className="flex-row my-3 items-center"
    >
      <Avatar
        size={50}
        title={initials}
        rounded
        containerStyle={{ backgroundColor: "dodgerblue" }}
        source={{ uri: photo }}
      />
      <View className="flex-1 ml-2  justify-start ">
        <View className="flex-row  justify-between items-start flex-1">
          <Text
            className="text-lg font-semibold dark:text-white  w-[70%] "
            numberOfLines={1}
          >
            {sender}
          </Text>
          <Text className="text-neutral-500 text-base">
            {isRecent
              ? messageTime.format("h:mm A")
              : messageTime.format("DD/MM/YYYY")}
          </Text>
        </View>
        <View className="flex-row justify-between items-start ">
          <Text
            className="text-neutral-500 font-[500] flex self-start w-[80%]"
            numberOfLines={2}
          >
            {message ? (
              <LatestMessage isUser={!isCurrentUser} message={message} />
            ) : (
              "No conversation"
            )}
          </Text>
          {chatsNotifications.length > 0 && (
            <View className=" bg-green-600 rounded-full flex self-start px-2 py-0.5">
              <Text className="text-white">
                {chatsNotifications.length > 99
                  ? "99+"
                  : chatsNotifications.length.toString()}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default UserChat;
