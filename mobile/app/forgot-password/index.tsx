import {
  View,
  Text,
  Image,
  TextInput,
  ImageSourcePropType,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { z, ZodType } from "zod";
import { ForgotPasswordProps } from "@/types";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import EmailSuccess from "@/components/EmailSuccess";
import AppButton from "@/components/AppButton";
import logo from "../../assets/uenrLogo.png";
import { baseUrl, postRequest } from "@/utils/service";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";

const Page = () => {
  const colorScheme = useColorScheme();
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const schema: ZodType<ForgotPasswordProps> = z.object({
    indexNumber: z
      .string()
      .length(10, { message: "Invalid indx number" })
      .nonempty({ message: "Index number is required" }),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordProps>({ resolver: zodResolver(schema) });

  const onSubmit: SubmitHandler<ForgotPasswordProps> = async (data) => {
    setLoading(true);
    try {
      const response = await postRequest(
        `${baseUrl}/api/auth/forgot-password`,
        token,
        JSON.stringify(data)
      );
      setLoading(false);
      if (response.error) {
        Alert.alert("Something went wrong", response.message);
        return;
      }
      Alert.alert(
        "Success",
        "A password reset link has been sent to your email."
      );
      setIsEmailSent(true);
    } catch (error) {
      Alert.alert("Something went wrong", (error as Error).message);
      setLoading(false);
    }
  };
  return (
    <View className="flex-1 dark:bg-black items-center justify-center px-6 py-12">
      <Image source={logo as ImageSourcePropType} className="h-16 w-12" />
      {isEmailSent ? (
        <EmailSuccess />
      ) : (
        <View className="w-full">
          <Text className="mt-6 text-center text-3xl font-bold tracking-tight dark:text-white">
            Forgot your password?
          </Text>
          <Text className="mt-2 text-center text-sm text-neutral-400">
            Enter your email address and we&apos;ll send you a link to reset
            your password
          </Text>
          <View className="w-full">
            <Controller
              control={control}
              name="indexNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  accessibilityLabel="Index Number Input"
                  placeholder="Index Number"
                  placeholderTextColor={
                    colorScheme === "dark" ? "#424646" : "black"
                  }
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className="block rounded-t-md h-11 w-full rounded-md px-3 py-2 text-sm dark:text-white focus-visible:ring-2 border border-[#e4e4e7] dark:border-neutral-700 focus:z-10 focus:border-[#2DAC5C] focus:ring-[#2DAC5C] dark:bg-neutral-900 mt-5"
                />
              )}
            />
            {errors.indexNumber && (
              <Text className="text-rose-700">
                {errors.indexNumber.message}
              </Text>
            )}
            <AppButton
              name="mt-8"
              onPress={handleSubmit(onSubmit)}
              disabled={loading || !!errors.indexNumber}
            >
              {loading ? <ActivityIndicator /> : <Text>Send email</Text>}
            </AppButton>
            <Text
              className="text-[#2DAC5C] text-center mt-2 font-semibold underline"
              onPress={() => router.push("/sign-in")}
            >
              Sign in?
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default Page;
