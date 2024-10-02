import React, { useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";
import { Text, useColorScheme, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppButton from "./AppButton";
import { useChat } from "@/context/ChatContext";
import * as FileSystem from "expo-file-system";

const AudioMessageRecorder = () => {
  const colorScheme = useColorScheme();
  const { recording, setRecording, sendTextMessage, chatId } = useChat();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const { setRecordedAudio } = useChat();
  const recordingTimeout = useRef<NodeJS.Timeout | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      if (permissionResponse?.status !== "granted") {
        const response = await requestPermission();
        if (response.status !== "granted") {
          console.error("Permission not granted for audio recording.");
        }
      }
    };

    checkPermissions();
  }, [permissionResponse, requestPermission]);

  const handleTooltipVisibility = () => {
    setVisible(true);
    const hideTooltipTimeout = setTimeout(() => {
      setVisible(false);
    }, 2000);
    return hideTooltipTimeout;
  };

  const startRecording = async () => {
    try {
      if (recording) return;
      recordingTimeout.current = setTimeout(async () => {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        setRecording(recording);
        handleTooltipVisibility();
        recordingTimeout.current = null;
      }, 2000);
    } catch (error) {
      console.error("Failed to start recording", error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setRecording(null);
    if (recordingTimeout.current) {
      clearTimeout(recordingTimeout.current);
      recordingTimeout.current = null;
      return;
    }
    await recording?.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording?.getURI();
    const base64 = await FileSystem.readAsStringAsync(uri as string, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log("Recording stopped and stored at", uri);
    setRecordedAudio("data:audio/m4a;base64," + base64);

    const tempMessageId = Date.now().toString();
    sendTextMessage(
      "data:audio/mp4;base64," + base64,
      "audio",
      chatId!,
      tempMessageId
    );
    setRecordedAudio(null);
    setRecording(null);
  };

  return (
    <View className="items-end">
      <View
        className={`absolute -top-6 w-24 p-1 rounded-lg bg-white ${visible ? "" : "hidden"}`}
      >
        <Text className="whitespace-nowrap text-xs text-center">
          Hold to record
        </Text>
      </View>
      <AppButton
        onPressIn={startRecording}
        onPressOut={stopRecording}
        variant="ghost"
        size="icon"
        name=""
        disabled={!!recording}
      >
        <MaterialCommunityIcons
          color={colorScheme === "dark" ? "#eee" : "#525252"}
          name={"microphone"}
          size={25}
        />
      </AppButton>
    </View>
  );
};

export default AudioMessageRecorder;
