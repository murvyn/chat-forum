import React from "react";
import { Stack } from "expo-router";

import ChatHeader from "@/components/ChatHeader";
import { useChat } from "@/context/ChatContext";

const DirectMessagesLayout = () => {
  const { selectedUser } = useChat();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={{
          header: () => <ChatHeader user={selectedUser} />,
        }}
      />
    </Stack>
  );
};

export default DirectMessagesLayout;
