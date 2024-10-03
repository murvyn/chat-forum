import { View, Text, TouchableOpacity } from "react-native";
import React, { Dispatch, SetStateAction, useCallback } from "react";
import { Avatar } from "@rneui/themed";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseUrl, postRequest } from "@/utils/service";
import { useAuth } from "@/context/AuthContext";
import { Message, UserChat } from "@/types";
import { useSocket } from "@/context/SocketContext";
import { useRouter } from "expo-router";

const PotentialChat = ({
  user,
  initials,
  id,
  dismiss,
  photo,
  setChatId,
  setRecipientId,
  setMessages,
}: {
  user: string;
  initials: string;
  id: string;
  photo: string;
  dismiss: () => void;
  setRecipientId: Dispatch<SetStateAction<string | null>>;
  setChatId: Dispatch<SetStateAction<string | null>>;
  setMessages: Dispatch<SetStateAction<Message[] | null>>;
}) => {
  const router = useRouter();
  const { token, user: current } = useAuth();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const createChat = useMutation({
    mutationFn: async (secondId: string) => {
      const response = await postRequest(
        `${baseUrl}/api/chats/create-direct-chat/${secondId}`,
        token
      );
      if (response.error) {
        throw new Error(response.error);
      }
      if (socket) {
        socket.emit("new-direct-chat", {
          senderId: current?._id,
          recipientId: id,
        });
      }
      return response.chat;
    },
    onError: (error: Error) => {
      console.log("Error creating chat", error);
    },
    onSuccess: (chat: UserChat) => {
      setChatId(chat._id);
      setRecipientId(id);
      setMessages(null);
      router.push(`/(app)/direct-messages/${chat._id}`);
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      dismiss();
    },
  });

  const handlePress = useCallback(async () => {
    try {
      const res = await createChat.mutateAsync(id);
      if (!res) {
        throw new Error("unable to create chat");
      }
    } catch (error) {
      console.log(error);
    }
  }, []);
  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={createChat.isPending}
      className="flex-row my-3 items-center "
    >
      <Avatar
        size={50}
        title={initials}
        rounded
        containerStyle={{ backgroundColor: "dodgerblue" }}
        source={{ uri: photo }}
      />
      <View className="flex-1 ml-2  justify-start ">
        <Text
          className="text-lg font-semibold dark:text-white  w-[70%] "
          numberOfLines={1}
        >
          {user}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default PotentialChat;
