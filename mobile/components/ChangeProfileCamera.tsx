import React, { Dispatch, SetStateAction, useState } from "react";
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
import { baseUrl, putRequest } from "@/utils/service";
import { Alert } from "react-native";
import { UserProps } from "@/types";

const ChangeProfileCamera = ({
  token,
  setUser,
}: {
  token: string;
  setUser: Dispatch<SetStateAction<UserProps | null>>;
}) => {
  const [media, setMedia] = useState<{ uri: string; type: string } | null>(
    null
  );
  const { dismiss } = useBottomSheetModal();

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setMedia({
        uri: result.assets[0].uri,
        type: result.assets[0].type as string,
      });
    }
  };

  const openImageLibrary = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission to access image library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setMedia({
        uri: result.assets[0].uri,
        type: result.assets[0].type as string,
      });
    }
  };

  const cancelImage = () => {
    setMedia(null);
  };

  const uploadProfileMutation = useMutation({
    mutationFn: async (photoUrl: string) => {
      const response = await putRequest(
        `${baseUrl}/api/auth`,
        token,
        JSON.stringify({ photoUrl })
      );
      return response;
    },
    onError: (error: Error) => {
      console.log("Error updating user", error);
      Alert.alert("Failed", error.message);
    },
    onSuccess: (response) => {
      if (response.error) {
        Alert.alert("Failed", response.message);
      } else {
        Alert.alert("Successful", "Profile picture successfully changed");
        setUser(response.user);
        dismiss();
      }
    },
  });

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
    onSuccess: async (response) => {
      await uploadProfileMutation.mutateAsync(response.url);
    },
    onError: () => {
      throw new Error("Failed to upload the file.");
    },
  });

  const sendImage = async () => {
    if (media) {
      const fileUri = media.uri;
      const fileType = media.type;
      try {
        await uploadMediaMutation.mutateAsync({
          fileUri,
          fileType,
        });
      } catch (error) {
        console.log("upload", error);
      } finally {
        dismiss();
      }
    }
  };

  return (
    <View>
      {media ? (
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
              {media.type === "video" ? (
                <Video
                  key={media.uri}
                  source={{ uri: media.uri }}
                  resizeMode={ResizeMode.CONTAIN}
                  useNativeControls
                  className="h-[80vh] w-[100vw]"
                />
              ) : (
                <Image
                  key={media.uri}
                  contentFit="cover"
                  source={{ uri: media.uri }}
                  className="h-[80vh] w-[100vw]"
                />
              )}
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
                {uploadMediaMutation.isPending ||
                uploadProfileMutation.isPending ? (
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
        </View>
      )}
    </View>
  );
};

export default ChangeProfileCamera;
