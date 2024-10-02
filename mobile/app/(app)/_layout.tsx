import React from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";
import { SocketProvider } from "@/context/SocketContext";

const Loading = () => {
  const colorScheme = useColorScheme();
  return (
    <View className="flex-1 dark:bg-black justify-center items-center">
      <ActivityIndicator
        size="large"
        color={colorScheme === "dark" ? "white" : "black"}
      />
    </View>
  );
};

export default function AppLayout() {
  const { session, isLoading } = useAuth();
  const colorScheme = useColorScheme();

  if (isLoading) {
    return <Loading />;
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SocketProvider>
      <ChatProvider>
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: colorScheme === "dark" ? "black" : "#eee",
              },
            }}
          />
        </Stack>
      </ChatProvider>
    </SocketProvider>
  );
}
