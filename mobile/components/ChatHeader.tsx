import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  Pressable,
  Alert,
} from "react-native";
import React, { useMemo, useRef } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Avatar } from "@rneui/themed";
import { UserGroupChatWithId, UserProps } from "@/types";
import { getInitials } from "@/utils/helpers";
import { useRouter } from "expo-router";
import { useSocket } from "@/context/SocketContext";
import { Feather } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import CustomBottomSheet from "./CustomBottomSheet";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import UserInfo from "./UserInfo";
import { baseUrl, postRequest } from "@/utils/service";
import { useChat } from "@/context/ChatContext";

const ChatHeader = ({
  user,
  channel,
  token,
}: {
  user?: UserProps | null;
  channel?: UserGroupChatWithId | null;
  token?: string;
}) => {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { notifications } = useChat();
  const { onlineUsers } = useSocket();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapUserPoints = useMemo(() => ["50%"], []);
  const snapChannelPoints = useMemo(() => ["70%"], []);
  const queryClient = useQueryClient();
  const { users } = useChat();

  const removerMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const response = await postRequest(
        `${baseUrl}/api/chats/group-chat/remove-member`,
        token,
        JSON.stringify({ chatId: channel?.chatId, memberId })
      );
      if (response.error) {
        throw new Error(response.error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const removeMember = (id: string) =>
    Alert.alert(
      "Are you absolutely sure?",
      "This action cannot be undone. This will permanently this member from your group.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => removerMemberMutation.mutate(id) },
      ]
    );

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => n.isRead === false),
    [notifications]
  );

  const isOnline = onlineUsers.some((online) => online.userId === user?._id);
  return (
    <View className="flex-row justify-between items-center bg-[#eee] dark:bg-black py-3 border-b border-b-neutral-300 dark:border-b-neutral-900">
      <View className="flex-row">
        <Pressable
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          className="flex-row items-center justify-center"
        >
          <MaterialCommunityIcons
            color={colorScheme === "dark" ? "white" : "black"}
            name="chevron-left"
            size={30}
          />
          {unreadNotifications.length > 0 && (
            <View className=" bg-green-600 rounded-full px-2 py-0.5">
              <Text className="text-white">
                {unreadNotifications.length > 99
                  ? "99+"
                  : unreadNotifications.length.toString()}
              </Text>
            </View>
          )}
        </Pressable>
        <TouchableOpacity
          onPress={() => bottomSheetRef.current?.present()}
          className="flex-row items-center ml-7"
        >
          <Avatar
            size={30}
            title={
              user
                ? getInitials(
                    user?.firstName as string,
                    user?.lastName as string
                  )
                : "#"
            }
            rounded
            source={{ uri: user?.photoUrl }}
            containerStyle={{ backgroundColor: "dodgerblue" }}
          />
          <View className="ml-2 justify-start ">
            <Text
              className="text-base  leading-4 font-semibold dark:text-white "
              numberOfLines={1}
            >
              {user ? `${user?.firstName} ${user?.lastName}` : channel?.name}
            </Text>
            {user && (
              <Text
                className="text-neutral-500 text-xs font-[500]"
                numberOfLines={1}
              >
                {isOnline ? "Online" : "Offline"}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <CustomBottomSheet
        ref={bottomSheetRef}
        snapPoints={user ? snapUserPoints : snapChannelPoints}
      >
        <UserInfo
          channel={channel}
          currentUser={currentUser}
          isOnline={isOnline}
          removeMember={removeMember}
          user={user}
          token={token as string}
          users={users}
        />
      </CustomBottomSheet>
    </View>
  );
};

export default ChatHeader;
