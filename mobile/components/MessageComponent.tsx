import React, { useState, useCallback, useMemo } from "react";
import { Text, StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { ResizeMode, Video } from "expo-av";
import AudioPlayer from "./AudioPlayer";
import FullScreenMediaViewer from "./FullScreenMediaViewer";

const MessageComponent = ({
  type,
  text,
  isCurrentUser,
}: {
  type: "text" | "document" | "audio" | "video" | "image";
  text: string;
  isCurrentUser: boolean;
}) => {
  const [isModalVisible, setModalVisible] = useState(false);

  const openFullscreen = useCallback(() => {
    setModalVisible(true);
  }, []);

  const closeFullscreen = useCallback(() => {
    setModalVisible(false);
  }, []);

  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  return (
    <View>
      {useMemo(() => {
        switch (type) {
          case "text":
            return <Text style={styles.text}>{text}</Text>;
          case "audio":
            return <AudioPlayer base64={text} />;
          case "video":
            return (
              <TouchableOpacity
                className={`overflow-hidden rounded-t-xl ${
                  isCurrentUser ? "rounded-bl-xl" : `rounded-br-xl`
                }`}
                onPress={openFullscreen}
              >
                <Video
                  source={{ uri: text }}
                  resizeMode={ResizeMode.CONTAIN}
                  useNativeControls
                  style={styles.media}
                />
              </TouchableOpacity>
            );
          case "image":
            return (
              <TouchableOpacity
                className={`overflow-hidden shadow-lg rounded-t-xl ${
                  isCurrentUser ? "rounded-bl-xl" : `rounded-br-xl`
                }`}
                onPress={openFullscreen}
              >
                <Image
                  style={styles.media}
                  placeholder={{ blurhash }}
                  source={{ uri: text }}
                  contentFit="cover"
                  transition={1000}
                />
              </TouchableOpacity>
            );
          default:
            return <Text style={styles.text}>{text}</Text>;
        }
      }, [text, type, openFullscreen])}

      <FullScreenMediaViewer
        visible={isModalVisible}
        onClose={closeFullscreen}
        media={{ uri: text, type: type === "image" ? "image" : "video" }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    color: "#000",
    margin: 8,
  },
  media: {
    width: 200,
    height: 300,
  },
});

export default MessageComponent;
