import { View, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Colors } from "@/constants/Colors";
import AppButton from "./AppButton";
import { useRouter } from "expo-router";

const EmailSuccess = () => {
  const router = useRouter();
  return (
    <View className="w-full">
      <Text className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground dark:text-white">
        Email sent!
      </Text>
      <Text className="mt-2 mb-8 text-sm text-center text-neutral-400">
        {`We've sent you a link to reset your password. Please check your email.`}
      </Text>
      <View className="flex items-center justify-center">
        <FontAwesome name="check-circle" size={50} color={Colors.primary} />
      </View>

      <AppButton name="mt-8" onPress={() => router.push("/sign-in")}>
        <Text>Return to sign in</Text>
      </AppButton>
    </View>
  );
};

export default EmailSuccess;
