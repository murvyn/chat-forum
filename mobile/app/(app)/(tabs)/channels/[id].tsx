import { View } from "react-native";
import React from "react";
import { ChatList } from "@/components/chat/ChatList";

const ChannelChat = () => {
  return (
    <View className="flex-1">
      <ChatList />
    </View>
  );
};

export default ChannelChat;
