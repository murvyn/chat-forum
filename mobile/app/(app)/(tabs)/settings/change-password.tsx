import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import React from "react";
import { TextInput } from "react-native";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z, ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AppButton from "@/components/AppButton";
import { baseUrl, putRequest } from "@/utils/service";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

interface Props {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePassword = () => {
  const { token } = useAuth();
  const colorScheme = useColorScheme();

  const schema: ZodType<Props> = z
    .object({
      oldPassword: z.string().nonempty({ message: "Password is required" }),
      newPassword: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/^(?=.*[a-z])/, {
          message: "Password must contain at least one lowercase letter",
        })
        .regex(/^(?=.*[A-Z])/, {
          message: "Password must contain at least one uppercase letter",
        })
        .regex(/^(?=.*[0-9])/, {
          message: "Password must contain at least one number",
        })
        .regex(/^(?=.*[!@#$%^&*])/, {
          message:
            "Password must contain at least one special character (!@#$%^&*)",
        })
        .nonempty({ message: "Password is required" }),
      confirmPassword: z
        .string()
        .nonempty({ message: "Confirm password is required" }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const changePasswordMutation = useMutation({
    mutationFn: async (password: {
      oldPassword: string;
      newPassword: string;
    }) => {
      return await putRequest(
        `${baseUrl}/api/auth`,
        token,
        JSON.stringify(password)
      );
    },
    onError: (error: Error) => {
      console.log("Error updating user", error);
      Alert.alert("Failed", error.message);
    },
    onSuccess: (response) => {
      if (response.error) {
        Alert.alert("Failed", response.message);
      } else {
        Alert.alert("Successful", "Password successfully changed");
        reset();
      }
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Props>({ resolver: zodResolver(schema) });
  const onSubmit: SubmitHandler<Props> = async (data) => {
    await changePasswordMutation.mutateAsync({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    });
  };
  return (
    <View className="px-4 mt-5">
      <View>
        <Text className="dark:text-white font-medium text-base">
          Old password
        </Text>
        <Controller
          control={control}
          name="oldPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
              placeholder="Enter old password"
              placeholderTextColor={
                colorScheme === "dark" ? "#424646" : "black"
              }
              className="block h-10  rounded-xl my-2 px-3 text-sm bg-neutral-200 dark:bg-neutral-800 dark:text-white"
            />
          )}
        />
        {errors.oldPassword && (
          <Text className="text-rose-700">{errors.oldPassword.message}</Text>
        )}
      </View>
      <View>
        <Text className="dark:text-white font-medium text-base">
          New password
        </Text>
        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
              placeholder="Enter new password"
              className="block h-10  rounded-xl my-2 px-3 text-sm bg-neutral-200 dark:bg-neutral-800 dark:text-white"
            />
          )}
        />
        {errors.newPassword && (
          <Text className="text-rose-700">{errors.newPassword.message}</Text>
        )}
      </View>
      <View>
        <Text className="dark:text-white font-medium text-base">
          Confirm password
        </Text>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
              placeholder="Re-enter password"
              className="block h-10  rounded-xl my-2 px-3 text-sm bg-neutral-200 dark:bg-neutral-800 dark:text-white"
            />
          )}
        />
        {errors.confirmPassword && (
          <Text className="text-rose-700">
            {errors.confirmPassword.message}
          </Text>
        )}
      </View>
      <AppButton
        onPress={handleSubmit(onSubmit)}
        disabled={changePasswordMutation.isPending}
        name="w-1/2 self-center mt-5"
      >
        {changePasswordMutation.isPending ? (
          <ActivityIndicator />
        ) : (
          <Text className="text-white font-semibold">Submit</Text>
        )}
      </AppButton>
    </View>
  );
};

export default ChangePassword;
