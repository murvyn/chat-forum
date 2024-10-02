import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppButton from "./AppButton";
import { ResizeMode, Video } from "expo-av";
import * as FileSystem from "expo-file-system";
import { useMutation } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";

const ImagePickerComponent = ({
  chatId,
  sendTextMessage,
}: {
  chatId: string | null;
  sendTextMessage: (
    textMessage: string,
    type: "text" | "document" | "audio" | "video" | "image",
    currentChatId: string,
    tempMessageId: string
  ) => void;
}) => {
  const [media, setMedia] = useState<{ uri: string; type: string }[]>([]);
  const [allowsEditing, setAllowsEditing] = useState(false);
  const { dismiss } = useBottomSheetModal();

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing,
      quality: 1,
      allowsMultipleSelection: true,
      aspect: [16, 9],
    });

    if (!result.canceled) {
      setMedia([
        { uri: result.assets[0].uri, type: result.assets[0].type as string },
      ]);
    }
  };

  const openImageLibrary = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access image library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing,
      quality: 1,
    });

    if (!result.canceled) {
      setMedia(
        result.assets.map((asset) => ({
          uri: asset.uri,
          type: asset.type as string,
        }))
      );
    }
  };

  const cancelImage = () => {
    setMedia([]);
  };

  const uploadMediaMutation = useMutation({
    mutationFn: async ({
      fileUri,
      fileType,
    }: {
      fileUri: string;
      fileType: string;
    }) => {
      try {
        const base64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const data = {
          file: `data:${fileType};base64,${base64}`,
          upload_preset: "llxw3yne",
          cloud_name: "droeaaqpq",
        };

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/droeaaqpq/upload",
          {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Failed to upload the file.");
        }

        return result;
      } catch (error) {
        console.log("Upload error:", error);
        throw error;
      }
    },
  });

  const sendImage = async () => {
    if (media.length > 0) {
      const fileUri = media[0].uri;
      const fileType = media[0].type;
      const tempId = Date.now().toString();

      try {
        const uploadResult = await uploadMediaMutation.mutateAsync({
          fileUri,
          fileType,
        });
        if (uploadResult && uploadResult.url) {
          sendTextMessage(
            uploadResult.url,
            fileType as "image" | "video",
            chatId as string,
            tempId
          );
          setMedia([]);
        } else {
          throw new Error("Failed to upload the file.");
        }
      } catch (error) {
        console.log("upload", error);
      } finally {
        dismiss();
      }
    }
  };

  return (
    <View>
      {media.length > 0 ? (
        <Modal transparent={true} className="">
          <SafeAreaView
            style={{
              paddingTop:
                Platform.OS === "android" ? StatusBar.currentHeight : 0,
              flex: 1,
            }}
            className="bg-black bg-opacity-0 justify-between"
          >
            <View>
              {media.map((item, index) => {
                return item.type === "video" ? (
                  <Video
                    key={index}
                    source={{ uri: item.uri }}
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls
                    className="h-[80vh] w-[100vw]"
                  />
                ) : (
                  <Image
                    key={index}
                    contentFit="cover"
                    source={{ uri: item.uri }}
                    className="h-[80vh] w-[100vw]"
                  />
                );
              })}
            </View>
            <View className="flex-row flex-1 items-center justify-between px-10">
              <AppButton
                variant="outline"
                name=" rounded-none bg-transparent flex-row space-x-3"
                onPress={cancelImage}
              >
                <MaterialCommunityIcons
                  name="trash-can"
                  size={20}
                  color="white"
                />
                <Text className="text-white  font-semibold">Cancel</Text>
              </AppButton>
              <AppButton name=" flex-row space-x-3" onPress={sendImage}>
                {uploadMediaMutation.isPending ? (
                  <ActivityIndicator color={"#eee"} />
                ) : (
                  <>
                    <Text className="text-white font-semibold">Send</Text>
                    <MaterialCommunityIcons
                      name="send"
                      size={20}
                      color="white"
                    />
                  </>
                )}
              </AppButton>
            </View>
          </SafeAreaView>
        </Modal>
      ) : (
        <View className="w-full h-full justify-center items-center">
          <AppButton variant="ghost" onPress={openCamera}>
            <Text className="text-lg text-blue-500">Take Photo</Text>
          </AppButton>
          <AppButton variant="ghost" onPress={openImageLibrary}>
            <Text className="text-lg text-blue-500">Pick from Library</Text>
          </AppButton>
          <AppButton
            variant="ghost"
            onPress={() => setAllowsEditing(!allowsEditing)}
          >
            <Text className="text-lg text-blue-500">
              {allowsEditing ? "Disable" : "Enable"} Cropping
            </Text>
          </AppButton>
        </View>
      )}
    </View>
  );
};

export default ImagePickerComponent;
