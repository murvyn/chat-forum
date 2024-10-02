import React, { useEffect, useState } from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { convertBase64 } from "@/utils/helpers";
import AppButton from "./AppButton";

interface AudioPlayerProps {
  base64: string;
  mainContainerClassName?: string;
  lineContainer?: string;
  line?: string;
  durationText?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  base64,
  mainContainerClassName,
  lineContainer,
  line,
  durationText,
}) => {
  const [sound, setSound] = useState<Audio.Sound>();
  const [status, setStatus] = useState<AVPlaybackStatus>();
  const [uri, setUri] = useState<string>();

  useEffect(() => {
    const convertAndSetUri = async () => {
      try {
        const audioUri = await convertBase64(base64);
        setUri(audioUri);
      } catch (e) {
        console.log("Failed to convert audio data", e);
      }
    };
    if (base64) {
      convertAndSetUri();
    }
  }, [base64]);

  const loadSound = async () => {
    if (!uri) return;
    try {
      console.log("loading sound");
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { progressUpdateIntervalMillis: 1000 / 60 },
        onPlaybackStatusUpdate
      );
      setSound(sound);
    } catch (error) {
      console.error("Failed to load sound", error);
    }
  };

  useEffect(() => {
    loadSound();
  }, [uri]);

  const onPlaybackStatusUpdate = async (newStatus: AVPlaybackStatus) => {
    setStatus(newStatus);

    if (!newStatus.isLoaded) return;

    if (newStatus.didJustFinish) {
      await sound?.setPositionAsync(0);
    }
  };

  async function playSound() {
    if (!sound) {
      return;
    }
    if (status?.isLoaded) {
      if (status.isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.replayAsync();
      }
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound, uri]);

  const formatMillis = (millis: number) =>
    [millis / (1000 * 60), (millis % (1000 * 60)) / 1000]
      .map((v) => `0${Math.floor(v)}`.slice(-2))
      .join(":");

  const isPlaying = status?.isLoaded ? status.isPlaying : false;
  const position = status?.isLoaded ? status.positionMillis : 0;
  const duration = status?.isLoaded ? status.durationMillis : 1;

  const progress = position / duration!;

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    left: `${progress * 100}%`,
  }));
  return (
    <View
      className={`w-56 shadow-lg flex-row items-center pt-2 px- rounded-md ${mainContainerClassName}`}
    >
      <AppButton variant="ghost" onPress={playSound} size="icon">
        <FontAwesome5
          name={isPlaying ? "pause" : "play"}
          size={20}
          color="gray"
        />
      </AppButton>
      <View className={`flex-1 h-5 justify-center ${lineContainer}`}>
        <View className={`h-0.5 bg-neutral-400 ${line}`} />
        <Animated.View
          style={[animatedIndicatorStyle]}
          className={`w-2.5 aspect-square bg-neutral-600 rounded-full absolute `}
        />
      </View>
      <Text className={`text-xs ml-4 text-neutral-700  ${durationText}`}>
        {formatMillis(duration || 0)}
      </Text>
    </View>
  );
};

export default AudioPlayer;

// const styles = StyleSheet.create({
//     container: {
//         // backgroundColor: "white",
//         // margin: 5,
//         // flexDirection: "row"
//     }
// })
