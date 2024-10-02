import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList } from "react-native";
import { Chip } from "react-native-paper";
import AppButton from "./AppButton";
import { Avatar } from "@rneui/themed";
import {
  BottomSheetTextInput,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { UserProps } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getInitials } from "@/utils/helpers";
import { baseUrl, postRequest } from "@/utils/service";
import { debounce } from "lodash";

const AddMemberModal = ({
  users,
  allUsers,
  chatId,
  token,
}: {
  users: UserProps[];
  allUsers: UserProps[];
  chatId: string;
  token: string;
}) => {
  const colorScheme = useColorScheme();
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<UserProps[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserProps[]>([]);
  const { dismiss } = useBottomSheetModal();
  const queryClient = useQueryClient();
  const otherUsers = useMemo(
    () => allUsers.filter((user) => !users.some((u) => u._id === user._id)),
    [users, allUsers]
  );
  const FormSchema = z.object({
    users: z.array(z.string()).min(1),
  });

  const addMemberMutation = useMutation({
    mutationFn: async (memberId: string[]) => {
      const response = await postRequest(
        `${baseUrl}/api/chats/group-chat/add-member`,
        token,
        JSON.stringify({ chatId, memberId })
      );
      if (response.error) {
        throw new Error(response.error);
      }
    },
    onSuccess: () => {
      Alert.alert("Successfully", "User has been added to group", [
        { text: "Ok", onPress: () => dismiss() },
      ]);
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleSearchDebounced = useCallback(
    debounce((search: string) => {
      const results = otherUsers.filter(
        (user) =>
          user.firstName.toLowerCase().includes(search.toLowerCase()) ||
          user.lastName.toLowerCase().includes(search.toLowerCase())
      );
      if (results) {
        setFilteredUsers(results);
      }
    }, 300),
    []
  );

  const {
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

  const onSubmit: SubmitHandler<{
    users: string[];
  }> = async (data) => {
    try {
      await addMemberMutation.mutateAsync(data.users);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleSelection = (item: UserProps) => {
    if (selectedUsers.some((selected) => selected._id === item._id)) {
      setSelectedUsers((prev) =>
        prev.filter((selected) => selected._id !== item._id)
      );
    } else {
      setSelectedUsers((prev) => [...prev, item]);
    }
  };

  return (
    <View className="px-4">
      <Text className="text-2xl font-bold dark:text-white">Add</Text>
      <Text className="text-neutral-400 mb-4">Add new members</Text>
      <BottomSheetTextInput
        onChangeText={(e) => {
          setSearch(e);
          handleSearchDebounced(e);
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
      <AppButton name=" mb-3" onPress={handleSubmit(onSubmit)}>
        {addMemberMutation.isPending ? (
          <ActivityIndicator />
        ) : (
          <Text className="text-white font-medium">Submit</Text>
        )}
      </AppButton>
      <FlatList
        data={search ? filteredUsers : otherUsers}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 300 }}
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

export default AddMemberModal;
