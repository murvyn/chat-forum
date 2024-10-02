import React, { useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodType } from "zod";

import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

import { LoginProps } from "@/types";
import { Link, useRouter } from "expo-router";
import AppButton from "@/components/AppButton";
import { useAuth } from "@/context/AuthContext";
import logo from "../assets/uenrLogo.png";

const App = () => {
  const router = useRouter();
  const { login, loginLoading } = useAuth();
  const [loginError, setLoginError] = useState("");
  const colorScheme = useColorScheme();

  const schema: ZodType<LoginProps> = z.object({
    indexNumber: z
      .string()
      .length(10, {
        message: "Index number must be exactly 10 characters long",
      })
      .nonempty({ message: "Index number is required" }),
    password: z
      .string()
      .min(8)
      .max(255)
      .nonempty({ message: "Password is required" }),
  });

  const onSubmit: SubmitHandler<LoginProps> = async (data) => {
    try {
      const response = await login(JSON.stringify(data));
      if (!response.error) {
        router.push("/direct-messages");
      }
      setLoginError(response.message);
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginProps>({ resolver: zodResolver(schema) });
  return (
    <View className="flex-1 items-center justify-center dark:bg-black px-4 py-12">
      <Image
        source={logo as ImageSourcePropType}
        className="mx-auto h-16 w-12"
      />
      <Text className="mt-6 text-center text-3xl font-bold tracking-tight dark:text-white">
        Sign in to your account
      </Text>
      <Link
        className="mt-2 text-center text-sm mb-5 text-muted-foreground font-medium underline text-[#2DAC5C]"
        href={"/forgot-password"}
      >
        <Text>Forgot your password?</Text>
      </Link>
      <View className="w-full">
        <Controller
          control={control}
          name="indexNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              accessible
              accessibilityLabel="Index Number"
              placeholder="Index Number"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              editable={!loginLoading}
              placeholderTextColor={
                colorScheme === "dark" ? "#424646" : "black"
              }
              className="block rounded-t-md h-11 w-full rounded-md px-3 py-2 text-sm dark:text-white focus-visible:ring-2 border border-[#e4e4e7] dark:border-neutral-700 focus:z-10 focus:border-[#2DAC5C] focus:ring-[#2DAC5C] dark:bg-neutral-900"
            />
          )}
        />
        {errors.indexNumber && (
          <Text className="text-rose-700">{errors.indexNumber.message}</Text>
        )}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Password"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholderTextColor={
                colorScheme === "dark" ? "#424646" : "black"
              }
              className="block rounded-t-md h-11 w-full rounded-md px-3 py-2 text-sm dark:text-white focus-visible:ring-2 border border-[#e4e4e7] dark:border-neutral-700 focus:z-10 focus:border-[#2DAC5C] focus:ring-[#2DAC5C] dark:bg-neutral-900"
            />
          )}
        />
        {errors.password && (
          <Text className="text-rose-700">{errors.password.message}</Text>
        )}
        {loginError && <Text className="text-red-600">{loginError}</Text>}
        <AppButton name="mt-8" onPress={handleSubmit(onSubmit)}>
          <Text className="font-medium text-sm text-white">
            {loginLoading ? (
              <ActivityIndicator className="" color={"#fff"} />
            ) : (
              "Sign in"
            )}
          </Text>
        </AppButton>
      </View>
    </View>
    // <View>
    //   <Text className="mt-5">hello</Text>
    // </View>
  );
};

export default App;
