import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  Keyboard,
} from "react-native";
import React, { useMemo, useRef, useState } from "react";
import { getInitials } from "@/utils/helpers";
import { UserGroupChatWithId, UserProps } from "@/types";
import {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import AppButton from "./AppButton";
import { Feather } from "@expo/vector-icons";
import { Avatar } from "@rneui/themed";
import CustomBottomSheet from "./CustomBottomSheet";
import AddMemberModal from "./AddMemberModal";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { baseUrl, putRequest } from "@/utils/service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator } from "react-native-paper";

const UserInfo = ({
  user,
  channel,
  currentUser,
  isOnline,
  removeMember,
  users,
  token,
}: {
  user: UserProps | null | undefined;
  channel: UserGroupChatWithId | null | undefined;
  currentUser: UserProps | null;
  isOnline: boolean;
  users: UserProps[];
  token: string;
  removeMember: (id: string) => void;
}) => {
  const [search, setSearch] = useState("");
  const colorScheme = useColorScheme();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["60%"], []);
  const queryClient = useQueryClient();
  const [edit, setEdit] = useState(false);

  const editGroupMutation = useMutation({
    mutationFn: async (channelName: string) => {
      const response = await putRequest(
        `${baseUrl}/api/chats/group-chat/edit-group`,
        token,
        JSON.stringify({ channelName, chatId: channel?.chatId })
      );
      if (response.error) {
        throw new Error(response.message);
      }
    },
    onSuccess: () => {
      Keyboard.dismiss();
      setEdit(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const FormSchema = z.object({
    channelName: z.string().min(3),
  });

  const { control, handleSubmit, reset } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit = (data: { channelName: string }) => {
    editGroupMutation.mutate(data.channelName);
  };

  const filteredUsers =
    channel?.users?.filter(
      (user) =>
        user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        user.lastName.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const sharedCourses = useMemo(() => {
    return currentUser?.courses?.filter((course) =>
      user?.courses.some((course2) => course._id === course2._id)
    );
  }, [currentUser, user]);

  const isOwner = useMemo(
    () => (channel?.owner ? channel?.owner === currentUser?._id : false),
    [channel?.owner, currentUser]
  );
  return (
    <View>
      {user ? (
        <View className="justify-start h-full items-center pt-2">
          <Avatar
            size={100}
            title={getInitials(
              user?.firstName as string,
              user?.lastName as string
            )}
            rounded
            containerStyle={{ backgroundColor: "dodgerblue" }}
            source={{ uri: user?.photoUrl }}
          />
          <Text
            className="text-2xl mt-2 font-semibold dark:text-white "
            numberOfLines={1}
          >
            {`${user?.firstName} ${user?.lastName}`}
          </Text>
          {isOnline && (
            <Text
              className="text-neutral-500 text-sm font-[500]"
              numberOfLines={1}
            >
              Online
            </Text>
          )}
          <Text className="mt-5 text-lg font-semibold dark:text-white">
            Shared Course
          </Text>
          <BottomSheetFlatList
            data={sharedCourses}
            keyExtractor={(item) => item._id as string}
            renderItem={({ item }) => (
              <TouchableOpacity>
                <Text className="text-lg text-blue-500">{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : (
        <View className="justify-start h-full items-center pt-2">
          <Avatar
            size={100}
            title={"#"}
            rounded
            containerStyle={{ backgroundColor: "dodgerblue" }}
          />
          {isOwner ? (
            <>
              {editGroupMutation.isPending ? (
                <ActivityIndicator />
              ) : (
                <View className="flex-row items-center space-x-3">
                  {edit ? (
                    <Controller
                      control={control}
                      name="channelName"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <BottomSheetTextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          placeholder="Enter name"
                          placeholderTextColor={
                            colorScheme === "dark" ? "#424646" : "black"
                          }
                          clearButtonMode="while-editing"
                          onSubmitEditing={handleSubmit(onSubmit)}
                          style={{
                            height: 40,
                            backgroundColor:
                              colorScheme === "light" ? "#e5e5e5" : "#262626",
                            width: 200,
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            marginTop: 10,
                            color: colorScheme === "light" ? "black" : "white",
                          }}
                          className="block h-10 mx-4 rounded-xl my-2 px-3 text-sm bg-neutral-200 dark:bg-neutral-800 dark:text-white"
                        />
                      )}
                    />
                  ) : (
                    <Text
                      className="text-2xl mt-2 font-semibold dark:text-white "
                      numberOfLines={1}
                    >
                      {channel?.name}
                    </Text>
                  )}
                  <AppButton
                    variant="ghost"
                    size="icon"
                    onPress={() => setEdit(!edit)}
                  >
                    <Feather
                      name={edit ? "x" : "edit"}
                      color={colorScheme === "light" ? "black" : "white"}
                      size={20}
                    />
                  </AppButton>
                </View>
              )}
            </>
          ) : (
            <Text
              className="text-2xl mt-2 font-semibold dark:text-white "
              numberOfLines={1}
            >
              {channel?.name}
            </Text>
          )}
          {isOwner && (
            <AppButton
              name="mt-4"
              onPress={() => bottomSheetRef.current?.present()}
            >
              <Text className="text-white font-medium">Add member</Text>
            </AppButton>
          )}
          <View className="w-full px-4 mt-2">
            <BottomSheetTextInput
              placeholder="Search users..."
              placeholderTextColor={
                colorScheme === "dark" ? "#424646" : "black"
              }
              onChangeText={(e) => {
                setSearch(e);
              }}
              value={search}
              clearButtonMode="while-editing"
              style={{
                height: 40,
                backgroundColor:
                  colorScheme === "light" ? "#e5e5e5" : "#262626",
                width: "100%",
                borderRadius: 8,
                paddingHorizontal: 12,
                color: colorScheme === "light" ? "black" : "white",
              }}
              className="block h-10 mx-4 rounded-xl my-2 px-3 text-sm bg-neutral-200 dark:bg-neutral-800 dark:text-white"
            />
          </View>
          <View className="w-full px-10 mt-5">
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 300 }}
              renderItem={({ item }) => (
                <View className="flex-row justify-between items-center">
                  <TouchableOpacity className="flex-row space-x-2 items-center justify-start mb-4">
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
                  {isOwner && (
                    <TouchableOpacity onPress={() => removeMember(item._id)}>
                      <Feather
                        color={colorScheme === "light" ? "black" : "white"}
                        name="x"
                        size={20}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          </View>
        </View>
      )}
      <CustomBottomSheet snapPoints={snapPoints} ref={bottomSheetRef}>
        <AddMemberModal
          allUsers={users}
          chatId={channel?.chatId as string}
          token={token}
          users={channel?.users as UserProps[]}
        />
      </CustomBottomSheet>
    </View>
  );
};

export default UserInfo;
