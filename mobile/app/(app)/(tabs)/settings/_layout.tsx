import React from "react";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

const SettingsLayout = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const sharedStyles = {
    contentStyle: {
      backgroundColor: isDarkMode ? "black" : "#eee",
    },
    headerStyle: {
      backgroundColor: isDarkMode ? "black" : "#eee",
    },
    headerTitleStyle: {
      color: isDarkMode ? "white" : "black",
    },
    headerBackTitle: "back",
  };
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="account-details"
        options={{
          headerTitle: "Account Details",
          ...sharedStyles,
        }}
      />
      <Stack.Screen
        name="change-password"
        options={{
          headerTitle: "Change Password",
          ...sharedStyles,
        }}
      />
    </Stack>
  );
};

export default SettingsLayout;
