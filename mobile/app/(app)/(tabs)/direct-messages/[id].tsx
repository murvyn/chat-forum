import { View } from "react-native";
import React from "react";
import { ChatList } from "@/components/chat/ChatList";

const Chat = () => {
  return (
    <View className="flex-1">
      <ChatList />
    </View>
  );
};

export default Chat;
