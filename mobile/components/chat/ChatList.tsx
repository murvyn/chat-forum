import React from "react";
import { useRef, useEffect } from "react";
import ChatBottomBar from "./ChatBottomBar";
import { useChat } from "@/context/ChatContext";
import { getFormattedTime, getInitials } from "@/utils/helpers";
import { useAuth } from "@/context/AuthContext";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import clsx from "clsx";
import { Avatar } from "@rneui/themed";
import { Keyboard } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";
import * as Clipboard from "expo-clipboard";
import MessageComponent from "../MessageComponent";

export function ChatList({ isChannel }: { isChannel?: boolean }) {
  const {
    messages,
    users,
    retrySendMessage,
    sendMessageLoading,
    messageLoading,
  } = useChat();
  const { user } = useAuth();

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        if (scrollViewRef.current) {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        if (scrollViewRef.current) {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const copyToClipboard = (textToCopy: string) => {
    Clipboard.setString(textToCopy);
    Alert.alert(
      "Copied to Clipboard",
      "The text has been copied to your clipboard."
    );
  };

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 75 : 0}
      className="justify-between h-full dark:bg-neutral-900"
    >
      {messageLoading ? (
        <>
          <View className="flex-1 w-full h-full justify-center items-center">
            <ActivityIndicator />
            <Text className="mt-2 dark:text-white">Loading messages...</Text>
          </View>
        </>
      ) : (
        <>
          {messages && messages?.length > 0 ? (
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={{ paddingBottom: 50 }}
              className=" relative"
              onContentSizeChange={() =>
                scrollViewRef.current?.scrollToEnd({ animated: true })
              }
              style={{ flex: 1 }}
            >
              {messages?.map((message) => {
                const formattedTime = getFormattedTime(message.createdAt);
                const selectedUser = users.find(
                  (user) => user._id === message.sender
                );
                const selectedUserInitials = getInitials(
                  selectedUser?.firstName as string,
                  selectedUser?.lastName as string
                );
                const isCurrentUser = message.sender === user?._id;
                if (!message._id) return;
                const isSending = sendMessageLoading[message._id] || false;
                const isMedia =
                  message.type === "image" || message.type === "video";
                return (
                  <View
                    key={message._id}
                    className={clsx(
                      "flex flex-col gap-2 py-1 px-[24px] whitespace-pre-wrap",
                      isCurrentUser ? "items-end" : "items-start"
                    )}
                  >
                    <View
                      className={`flex-row ${isCurrentUser ? "flex-row-reverse" : ""} items-center`}
                    >
                      {!isCurrentUser && isChannel && (
                        <>
                          <View className="relative inline-block mr-2">
                            <Avatar
                              rounded
                              title={selectedUserInitials}
                              containerStyle={{ backgroundColor: "dodgerblue" }}
                              source={{ uri: selectedUser?.photoUrl }}
                            />
                          </View>
                        </>
                      )}
                      <View className="">
                        <View className="flex-row items-center">
                          <TouchableOpacity
                            accessibilityLabel={`Copy message: ${message.text}`}
                            onLongPress={() => copyToClipboard(message.text)}
                            className={`${
                              isCurrentUser
                                ? "bg-green-300 text-accent self-end rounded-bl-xl"
                                : `bg-neutral-200 rounded-br-xl`
                            } py-1 px-2 rounded-t-xl max-w-xs ${isMedia ? "bg-transparent" : ""} ${isSending ? "opacity-50 flex-row" : ""} `}
                          >
                            <View>
                              <MessageComponent
                                isCurrentUser={isCurrentUser}
                                text={message.text}
                                type={message.type}
                              />
                            </View>
                            <Text
                              className={`text-neutral-500 text-xs self-end text-[9px] `}
                            >
                              {formattedTime}
                            </Text>
                          </TouchableOpacity>
                          {message.error && !isSending && (
                            <View className="ml-2">
                              <AntDesign
                                onPress={() => retrySendMessage(message)}
                                name="exclamationcircleo"
                                size={24}
                                color="red"
                              />
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <View className="flex-1 w-full h-full justify-center items-center">
              <Text className="text-neutral-300">No conversation</Text>
            </View>
          )}
        </>
      )}
      <ChatBottomBar />
    </KeyboardAvoidingView>
  );
}
