import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useEffect, useMemo } from "react";
import { Avatar } from "@rneui/themed";
import { useRouter } from "expo-router";
import { useChat } from "@/context/ChatContext";
import moment from "moment";
import { unreadNotification } from "@/utils/helpers";
import { Message } from "@/types";
import { useAuth } from "@/context/AuthContext";
import LatestMessage from "./LatestMessage";
import { useMutation } from "@tanstack/react-query";

const ChannelChat = ({
  chatId,
  name,
  message,
}: {
  chatId: string;
  name: string;
  message: Message;
}) => {
  const { setChatId, notifications, markAsRead, getMessages, setMessages, setMessageLoading } = useChat();
  const { user } = useAuth();
  const router = useRouter();

  const messagesMutation = useMutation({
    mutationFn: (id: string) => getMessages(id!),
    onSuccess: (data) => {
      setMessages(data);
    },
    onError: (error) => {
      console.error("Error fetching messages:", error);
    },
  })

  useEffect(() => {
    setMessageLoading(messagesMutation.isPending)
  }, [messagesMutation.isPending])

  const handlePress = (id: string) => {
    setChatId(id);
    messagesMutation.mutate(id)
    if (chatsNotifications) {
      markAsRead(chatId as string, notifications);
    }
    router.push(`/channels/${id}`);
  };

  const chatsNotifications = useMemo(
    () => unreadNotification(notifications)?.filter((n) => n.chatId === chatId),
    [notifications, chatId]
  );

  const now = moment();
  const messageTime = moment(message?.createdAt);
  const isRecent = now.diff(messageTime, "hours") < 24;
  const isCurrentUser = message?.sender === user?._id;

  return (
    <TouchableOpacity
      onPress={() => handlePress(chatId)}
            accessibilityLabel={`Chat with ${name}`}
      accessibilityHint="Opens chat"
      className="flex-row my-3 items-center"
    >
      <Avatar
        size={50}
        title="#"
        rounded
        containerStyle={{ backgroundColor: "dodgerblue" }}
      />
      <View className="flex-1 ml-2  justify-start ">
        <View className="flex-row  justify-between items-start flex-1">
          <Text
            className="text-lg font-semibold dark:text-white  w-[70%] "
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text className="text-neutral-500 text-base">
            {isRecent
              ? messageTime.format("h:m A")
              : messageTime.format("d/m/y")}
          </Text>
        </View>
        <View className="flex-row justify-between items-start ">
          <Text
            className="text-neutral-500 font-[500] flex self-start w-[80%]"
            numberOfLines={2}
          >
            {message ? (
              <LatestMessage isUser={isCurrentUser} message={message} />
            ) : (
              "No conversation"
            )}
          </Text>
          {chatsNotifications.length > 0 && (
            <View className=" bg-green-600 rounded-full flex self-start px-2 py-0.5">
              <Text className="text-white">
              {chatsNotifications.length > 99 ? "99+" : chatsNotifications.length}
              </Text>
            </View>
          )}
        </View>
        {messagesMutation.isPending && (
          <ActivityIndicator size="small" color="blue" />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ChannelChat;
