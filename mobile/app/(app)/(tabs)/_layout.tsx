import {
  SafeAreaView,
  Platform,
  StatusBar,
  useColorScheme,
} from "react-native";
import React, { useMemo } from "react";
import { Tabs, usePathname } from "expo-router";
import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useChat } from "@/context/ChatContext";
import { unreadNotification } from "@/utils/helpers";

const TabsLayout = () => {
  const colorScheme = useColorScheme();
  const { chatId, notifications, userGroupChats } = useChat();
  const pathname = usePathname();

  const unread = useMemo(
    () => unreadNotification(notifications),
    [notifications]
  );

  const chatNotification = useMemo(
    () =>
      unread.filter(
        (n) =>
          !Object.prototype.hasOwnProperty.call(n, "courseId") &&
          !userGroupChats?.some((chat) => chat.chatId === n.chatId)
      ),
    [unread, userGroupChats]
  );
  const channelNotification = useMemo(
    () =>
      unread.filter(
        (n) =>
          Object.prototype.hasOwnProperty.call(n, "courseId") ||
          userGroupChats?.some((chat) => {
            if (chat.chatId === n.chatId) {
              return Object.prototype.hasOwnProperty.call(chat, "owner");
            }
          })
      ),
    [unread, userGroupChats]
  );

  return (
    <SafeAreaView
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        flex: 1,
      }}
    >
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          headerShown: false,
          tabBarStyle: {
            position: "absolute",
            backgroundColor: "transparent",
            borderTopWidth: colorScheme === "dark" ? 0 : 1,
            elevation: 0,
            display:
              pathname === `/direct-messages/${chatId}` ||
              pathname === `/channels/${chatId}`
                ? "none"
                : "flex",
          },
          tabBarBackground() {
            return (
              <BlurView
                tint={colorScheme === "dark" ? "dark" : "light"}
                intensity={100}
                style={{ flex: 1 }}
              />
            );
          },
        }}
      >
        <Tabs.Screen
          name="direct-messages"
          options={{
            title: "Direct Messages",
            tabBarLabel: "Messages",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={20} name="paper-plane" color={color} />
            ),
            tabBarBadge:
              chatNotification.length > 0 ? chatNotification.length : undefined,
            tabBarBadgeStyle: { backgroundColor: "green" },
          }}
        />
        <Tabs.Screen
          name="channels"
          options={{
            title: "Channels",
            tabBarLabel: "Channels",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={20} name="users" color={color} />
            ),
            tabBarBadge:
              channelNotification.length > 0
                ? channelNotification.length
                : undefined,
            tabBarBadgeStyle: { backgroundColor: "green" },
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={20} name="gear" color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
};

export default TabsLayout;
