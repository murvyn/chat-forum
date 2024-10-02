import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { UserChatWithId, UserGroupChatWithId } from "@/types";
import { baseUrl, getRequest } from "@/utils/services";
import { useQueries } from "@tanstack/react-query";
import { useEffect } from "react";

const fetchLatestMessage = async (chatId: string, token: string) => {
  try {
    const response = await getRequest(
      `${baseUrl}/chats/${chatId}/messages?latest=true`,
      token
    );
    if (response.error || !response.messages || response.messages.length === 0) {
      throw new Error("No messages found.");
    }

    return response.messages
  } catch (error) {
    console.error(`Error fetching latest message for chat ${chatId}:`, error);
    return null;
  }
};

export const useFetchLatestMessagesForChats = (
  userChats: UserChatWithId[] | UserGroupChatWithId[] | null = []
) => {
  const { user, token } = useAuth();

  const queries =
    userChats?.map((chat) => ({
      queryKey: ["latestChatMessage", chat.chatId],
      queryFn: () => fetchLatestMessage(chat.chatId as string, token),
      enabled: !!chat.chatId && !!user,
      staleTime: Infinity,
      refetchIntervalInBackground: true,
    })) ?? [];

  const results = useQueries({
    queries,
  });

  const isLoading = results.some((result) => result.isLoading);

  const chatsWithLatestMessages = userChats?.map((chat, index) => {
    const latestMessage = results[index]?.data;
    const refetch = results[index]?.refetch;
    return {
      ...chat,
      latestMessage: latestMessage || null,
      refetchLatestMessage: refetch,
    };
  });
  return { chatsWithLatestMessages, isLoading };
};

export const useSortedChats = (
  userChats: UserChatWithId[] | UserGroupChatWithId[]
) => {
  const { chatsWithLatestMessages } = useFetchLatestMessagesForChats(userChats);
  const { notifications, newMessage } = useChat();

  useEffect(() => {
    if (!chatsWithLatestMessages) {
      return;
    }
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      const latestMessage = chatsWithLatestMessages.find(
        (chat) => chat.chatId === latestNotification.chatId
      );
      latestMessage?.refetchLatestMessage();
    }
    if (newMessage) {
      const latestMessage = chatsWithLatestMessages.find(
        (chat) => chat.chatId === newMessage.chatId
      );
      latestMessage?.refetchLatestMessage();
    }
  }, [notifications, newMessage]);

  if (!chatsWithLatestMessages) {
    return;
  }
  return [...chatsWithLatestMessages].sort((a, b) => {
    if (a.latestMessage === null) {
      return 1;
    }
    if (b.latestMessage === null) {
      return -1;
    }
    return (
      (new Date(b.latestMessage.createdAt) as unknown as number) -
      (new Date(a.latestMessage.createdAt) as unknown as number)
    );
  });
};
