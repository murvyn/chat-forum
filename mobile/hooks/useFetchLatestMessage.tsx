import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { UserChatWithId, UserGroupChatWithId } from "@/types";
import { baseUrl, getRequest } from "@/utils/service";
import { useQueries } from "@tanstack/react-query";
import { useEffect } from "react";

const fetchLatestMessage = async (chatId: string, token: string) => {
  try {
    const response = await getRequest(
      `${baseUrl}/api/chats/${chatId}/messages?latest=true`,
      token
    );
    if (response.error || !response.messages || response.messages.length === 0) {
      return null;
    }
    return response.messages;
  } catch (error) {
    console.error("Error fetching latest messages:", error);
    return null;
  }
};

export const useFetchLatestMessagesForChats = (
  userChats: UserChatWithId[] | UserGroupChatWithId[]
) => {
  const { token, user } = useAuth();

  const queries = userChats?.map((chat) => ({
    queryKey: ["latestChatMessage", chat.chatId],
    queryFn: () => fetchLatestMessage(chat.chatId as string, token),
    enabled: !!chat && !!user,
    staleTime: Infinity,
    refetchIntervalInBackground: true,
  }));

  const results = useQueries({
    queries,
  });

  const isLoading = results.some((result) => result.isLoading);

  const chatsWithLatestMessages = userChats.map((chat, index) => {
    const latestMessage = results[index]?.data;
    const refetch = results[index]?.refetch;
    return {
      ...chat,
      latestMessage: latestMessage || null,
      refetchLatestMessage: refetch
    };
  });
  return { chatsWithLatestMessages, isLoading };
};

export const useSortedChats = (
  userChats: UserChatWithId[] | UserGroupChatWithId[], filter: "All" | "Unread" | "Students" | "Lecturers"
) => {
  if(!userChats) return
  const { chatsWithLatestMessages } = useFetchLatestMessagesForChats(userChats);
  const { notifications, newMessage } = useChat()

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0]
      const latestMessage = chatsWithLatestMessages.find(chat => chat.chatId === latestNotification.chatId)
      latestMessage?.refetchLatestMessage()
    }
    if(newMessage){
      const latestMessage = chatsWithLatestMessages.find(chat => chat.chatId === newMessage.chatId)
      latestMessage?.refetchLatestMessage()
    }
  }, [notifications, newMessage])

  const sortedChats = [...chatsWithLatestMessages].sort((a, b) => {
    if (a.latestMessage === null) return 1;
    if (b.latestMessage === null) return -1;
    return (new Date(b.latestMessage.createdAt) as unknown as number) - (new Date(a.latestMessage.createdAt) as unknown as number);
  });

  let sort;
    switch (filter) {
      case "All":
        return sortedChats;
      case "Unread":
        sort = sortedChats?.filter((chat) =>
          notifications.some((not) => {
            return not.chatId === chat.chatId && not.isRead === false;
          })
        );
        return sort;
      case "Students":
        sort = sortedChats?.filter((chat) => chat.user?.role === "student");
        return sort;
      case "Lecturers":
        sort = sortedChats?.filter((chat) => chat.user?.role === "lecturer");
        return sort;
      default:
        return sortedChats;
    }

};
