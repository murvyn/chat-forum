import React from "react";
import { Stack } from "expo-router";

import ChatHeader from "@/components/ChatHeader";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";

const DirectMessagesLayout = () => {
  const {channel} = useChat()
  const {token} = useAuth()
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={{
          header: channel && token ? () => <ChatHeader token={token} channel={channel} /> : undefined,
        }}
      />
    </Stack>
  );
};

export default DirectMessagesLayout;
