import React, { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@/context/ChatContext";
import AppButton from "../AppButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TextInput, useColorScheme, View } from "react-native";
import AudioMessageRecorder from "../AudioMessageRecorder";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import CustomBottomSheet from "../CustomBottomSheet";
import CameraPreview from "../CameraPreview";

const ChatBottomBar = () => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendTextMessage, chatId, recording } = useChat();
  const colorScheme = useColorScheme();
  const snapPoints = useMemo(() => ["20%"], []);
  const BottomSheetRef = useRef<BottomSheetModal>(null);

  const handleInputChange = (text: string) => {
    setMessage(text);
  };

  const handleSend = async () => {
    try {
      if (message.trim()) {
        const tempMessageId = Date.now().toString();
        console.log(tempMessageId);
        sendTextMessage(message.trim(), "text", chatId!, tempMessageId);
        setMessage("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [message]);

  return (
    <View className="p-2 bg-gray-200 dark:bg-neutral-800 flex-row justify-between w-full items-end">
      <View className="">
        <AppButton variant="ghost" size="icon">
          <MaterialCommunityIcons
            name="paperclip"
            size={20}
            color={colorScheme === "dark" ? "#eee" : "#525252"}
          />
        </AppButton>
      </View>
      <View className="flex-1">
        {recording ? (
          <>
            <Text>Recording</Text>
          </>
        ) : (
          <>
            <TextInput
              multiline
              accessibilityLabel="Message input"
              value={message}
              onChangeText={handleInputChange}
              placeholder="Message"
              placeholderTextColor={
                colorScheme === "dark" ? "#424646" : "black"
              }
              className="bg-white dark:bg-neutral-900 dark:text-white flex items-center resize-none overflow-y-auto bg-background p-2 max-h-40 bg-neu rounded-lg outline-none text-sm "
            />
          </>
        )}
      </View>
      <View>
        {message.trim() ? (
          <AppButton onPress={handleSend} variant="ghost" size="icon">
            <MaterialCommunityIcons
              color={colorScheme === "dark" ? "#eee" : "#525252"}
              name="send"
              size={25}
            />
          </AppButton>
        ) : (
          <View className="flex-row items-end">
            <View className="flex-1  ">
              <CustomBottomSheet ref={BottomSheetRef} snapPoints={snapPoints}>
                <CameraPreview
                  chatId={chatId}
                  sendTextMessage={sendTextMessage}
                />
              </CustomBottomSheet>
            </View>
            <AppButton
              onPress={() => {
                BottomSheetRef.current?.present();
              }}
              variant="ghost"
              size="sm"
            >
              <MaterialCommunityIcons
                color={colorScheme === "dark" ? "#eee" : "#525252"}
                name="camera"
                size={25}
              />
            </AppButton>
            <AudioMessageRecorder />
          </View>
        )}
      </View>
    </View>
  );
};

export default ChatBottomBar;
