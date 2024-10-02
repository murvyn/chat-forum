import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  BottomSheetTextInput,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { View } from "react-native";
import { Avatar } from "@rneui/themed";
import { UserChat, UserProps } from "@/types";
import { getInitials } from "@/utils/helpers";
import { Chip } from "react-native-paper";
import AppButton from "./AppButton";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseUrl, postRequest } from "@/utils/service";
import { useRouter } from "expo-router";

const CreateChannelModal = ({
  users,
  setChatId,
  token,
}: {
  users: UserProps[];
  setChatId: Dispatch<SetStateAction<string | null>>;
  token: string;
}) => {
  const colorScheme = useColorScheme();
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserProps[]>([]);
  const { dismiss } = useBottomSheetModal();
  const queryClient = useQueryClient();
  const router = useRouter();

  const FormSchema = z.object({
    users: z.array(z.string()).min(2),
    channelName: z.string().min(3),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  useEffect(() => {
    const selectedIds = selectedUsers.map((user) => user._id);
    setValue("users", selectedIds);
  }, [selectedUsers]);

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelection = (item: UserProps) => {
    if (selectedUsers.some((selected) => selected._id === item._id)) {
      setSelectedUsers((prev) =>
        prev.filter((selected) => selected._id !== item._id)
      );
    } else {
      setSelectedUsers((prev) => [...prev, item]);
    }
  };

  const createChannelMutation = useMutation({
    mutationFn: async (data: { name: string; members: string[] }) => {
      const response = await postRequest(
        `${baseUrl}/api/chats/create-group-chat`,
        token,
        JSON.stringify({
          data,
        })
      );
      if (response.error) {
        throw new Error(response.error);
      }
      return response.chat;
    },
    onError: (error: Error) => {
      console.log("Error creating chat", error);
    },
    onSuccess: (chat: UserChat) => {
      setChatId(chat._id);
      router.push(`/(app)/channels/${chat._id}`);
      dismiss();
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
    },
  });

  const onSubmit: SubmitHandler<{
    channelName: string;
    users: string[];
  }> = async (data) => {
    try {
      await createChannelMutation.mutateAsync({
        name: data.channelName,
        members: data.users,
      });
      setSelectedUsers([]);
      setSearch("");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to create channel. Please try again.");
    }
  };

  return (
    <View className="px-4">
      <Text className="text-xl font-bold dark:text-white">Create Channel</Text>
      <Text className="text-neutral-400">
        Start a new group chat with your team.
      </Text>
      <Text className="text-base mt-5 font-semibold dark:text-white">
        Channel name
      </Text>
      <Controller
        control={control}
        name="channelName"
        render={({ field: { onChange, onBlur, value } }) => (
          <BottomSheetTextInput
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Name of your channel"
            placeholderTextColor={colorScheme === "dark" ? "#424646" : "black"}
            clearButtonMode="while-editing"
            style={{
              height: 40,
              backgroundColor: colorScheme === "light" ? "#e5e5e5" : "#262626",
              width: "100%",
              borderRadius: 8,
              paddingHorizontal: 12,
              color: colorScheme === "light" ? "black" : "white",
            }}
          />
        )}
      />
      {errors.channelName && (
        <Text className="text-rose-700">{errors.channelName.message}</Text>
      )}
      <Text className="text-base mt-3 font-semibold dark:text-white">
        Add users
      </Text>
      <BottomSheetTextInput
        onChangeText={(e) => {
          setSearch(e);
        }}
        placeholder="Search..."
        placeholderTextColor={colorScheme === "dark" ? "#424646" : "black"}
        clearButtonMode="while-editing"
        style={{
          height: 40,
          backgroundColor: colorScheme === "light" ? "#e5e5e5" : "#262626",
          width: "100%",
          borderRadius: 8,
          paddingHorizontal: 12,
          color: colorScheme === "light" ? "black" : "white",
        }}
      />
      <View className="my-2">
        <FlatList
          className="space-x-10"
          data={selectedUsers}
          keyExtractor={(item) => item._id}
          numColumns={3}
          key={selectedUsers.length}
          renderItem={({ item }) => (
            <Chip
              onClose={() => {
                setSelectedUsers((prev) =>
                  prev.filter((selected) => selected._id !== item._id)
                );
              }}
            >
              {item.firstName}
            </Chip>
          )}
        />
      </View>
      {errors.users && (
        <Text className="text-rose-700">{errors.users.message}</Text>
      )}
      <AppButton
        disabled={createChannelMutation.isPending}
        name=" mb-3"
        onPress={handleSubmit(onSubmit)}
      >
        {createChannelMutation.isPending ? (
          <ActivityIndicator />
        ) : (
          <Text className="text-white font-medium">Submit</Text>
        )}
      </AppButton>
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 500 }}
        renderItem={({ item }) => {
          const isSelected = selectedUsers.some(
            (selected) => selected._id === item._id
          );
          return (
            <TouchableOpacity
              onPress={() => toggleSelection(item)}
              className={`flex-row space-x-2 items-center justify-start  rounded-lg mb-4 ${isSelected ? "" : "opacity-40"}`}
            >
              <Avatar
                size={40}
                title={getInitials(
                  item?.firstName as string,
                  item?.lastName as string
                )}
                rounded
                containerStyle={{ backgroundColor: "dodgerblue" }}
                source={{ uri: item?.photoUrl }}
              />
              <Text className="text-base font-medium dark:text-white">{`${item?.firstName} ${item?.lastName}`}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default CreateChannelModal;
