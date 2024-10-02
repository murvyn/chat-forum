import React from "react";
import { Modal, Dimensions, StyleSheet, TouchableOpacity } from "react-native";
import { ResizeMode, Video } from "expo-av";
import {
  GestureEvent,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const FullScreenMediaViewer = ({
  visible,
  media,
  onClose,
}: {
  visible: boolean;
  media: { uri: string; type: string };
  onClose: () => void;
}) => {
  const translateY = useSharedValue(0);

  const handleGesture = (
    event: GestureEvent<PanGestureHandlerEventPayload>
  ) => {
    if (event.nativeEvent.translationY > 100) {
      runOnJS(onClose)();
    } else {
      translateY.value = withSpring(0);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  return (
    <Modal visible={visible} transparent={true} animationType="none">
      <PanGestureHandler onGestureEvent={handleGesture}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <TouchableOpacity
            onPress={onClose}
            className="p-3  absolute z-40 top-0 left-0"
          >
            <MaterialCommunityIcons color="white" name="close" size={30} />
          </TouchableOpacity>
          {media.type === "video" ? (
            <Video
              source={{ uri: media.uri }}
              style={styles.media}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
              shouldPlay
            />
          ) : (
            <Image
              placeholder={{ blurhash }}
              source={{ uri: media.uri }}
              style={styles.media}
              contentFit={"contain"}
            />
          )}
        </Animated.View>
      </PanGestureHandler>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  media: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});

export default FullScreenMediaViewer;
