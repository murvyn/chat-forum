import {
  Message,
  Notifications,
  UploadResponse,
  UserChat,
  UserChatWithId,
  UserGroupChatWithId,
  UserProps,
} from "@/types";
import { baseUrl, getRequest, postRequest } from "@/utils/services";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "./SocketContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import groupNotificationSound from "@/assets/mixkit-cooking-bell-ding-1791.wav";
import notificationSound from "@/assets/mixkit-cowbell-sharp-hit-1743.wav";

interface ChatContextProps {
  userChats: UserChatWithId[] | null;
  potentialChats: UserProps[] | null;
  recipientId: string;
  selectedUser: UserProps | null;
  setRecipientId: Dispatch<SetStateAction<string>>;
  setSelectedUser: Dispatch<SetStateAction<UserProps | null>>;
  setChannel: Dispatch<SetStateAction<UserGroupChatWithId | null>>;
  sendTextMessage: (
    textMessage: string,
    type: "text" | "document" | "audio" | "video" | "image",
    currentChatId: string,
    tempMessageId: string
  ) => void;
  retrySendMessage: (message: Message) => void;
  messages: Message[] | null;
  setMessages: Dispatch<SetStateAction<Message[] | null>>;
  setCallNotification: Dispatch<
    SetStateAction<{
      chatId: string;
      callerId: string;
      callType: "voice" | "video";
    } | null>
  >;
  callNotification: {
    chatId: string;
    callerId: string;
    callType: "voice" | "video";
  } | null;
  setEndCallNotification: Dispatch<
    SetStateAction<{
      chatId: string;
      callerId: string;
      action: string;
    } | null>
  >;
  endCallNotification: {
    chatId: string;
    callerId: string;
    action: string;
  } | null;
  setChatId: Dispatch<SetStateAction<string>>;
  chatId: string;
  setMessageLoading: Dispatch<SetStateAction<boolean>>;
  messageLoading: boolean;
  userGroupChats: UserGroupChatWithId[] | null;
  channel: UserGroupChatWithId | null;
  sendTextMessageError: string;
  notifications: Notifications[];
  markAsRead: (chatId: string, notifications: Notifications[]) => void;
  upload: (file: File) => Promise<UploadResponse | null>;
  fetchMoreMessages: (
    setScrollLoading: Dispatch<SetStateAction<boolean>>
  ) => void;
  getMessages: (chatId: string) => Promise<Message[]>;
  sendMessageLoading: { [key: string]: boolean };
  isLoadingUserChats: boolean;
  users: UserProps[];
  newMessage: Message | null;
}

export const ChatContext = createContext<ChatContextProps>({
  userChats: [],
  potentialChats: [],
  recipientId: "",
  setRecipientId: () => {},
  setSelectedUser: () => {},
  selectedUser: null,
  sendTextMessage: () => {},
  retrySendMessage: () => {},
  messages: [],
  setChatId: () => null,
  chatId: "",
  userGroupChats: [],
  channel: null,
  sendTextMessageError: "",
  notifications: [],
  markAsRead: () => null,
  upload: () => Promise.resolve(null),
  fetchMoreMessages: () => {},
  setChannel: () => null,
  getMessages: () => Promise.resolve([]),
  setMessageLoading: () => null,
  messageLoading: false,
  sendMessageLoading: {},
  isLoadingUserChats: false,
  users: [],
  newMessage: null,
  setMessages: () => null,
  callNotification: null,
  setCallNotification: () => null,
  endCallNotification: null,
  setEndCallNotification: () => null,
});

export const useChat = () => {
  return useContext(ChatContext);
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [userChats, setUserChats] = useState<UserChatWithId[] | null>(null);
  const [recipientId, setRecipientId] = useState<string>(
    () => localStorage.getItem("recipientId") || ""
  );
  const [userGroupChats, setUserGroupChats] = useState<
    UserGroupChatWithId[] | null
  >(null);
  const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);
  const [potentialChats, setPotentialChats] = useState<UserProps[] | null>(
    null
  );
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [newMessage, setNewMessage] = useState<Message | null>(null);
  const [sendTextMessageError, setSendTextMessageError] = useState("");
  const [chatId, setChatId] = useState<string>(
    () => localStorage.getItem("chatId") || ""
  );
  const [callNotification, setCallNotification] = useState<{
    chatId: string;
    callerId: string;
    callType: "voice" | "video";
  } | null>(null);
  const [endCallNotification, setEndCallNotification] = useState<{
    chatId: string;
    callerId: string;
    action: string;
  } | null>(null);
  const [channel, setChannel] = useState<UserGroupChatWithId | null>(null);
  const [notifications, setNotifications] = useState<Notifications[]>([]);
  const [sendMessageLoading, setSendMessageLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [messageLoading, setMessageLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { pathname } = useLocation();
  const { user, token } = useAuth();
  const { toast, dismiss } = useToast();
  const navigate = useNavigate();


  useEffect(() => {
    localStorage.setItem("chatId", chatId);
  }, [chatId]);

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response: { users: UserProps[] } = await getRequest(
        `${baseUrl}/users`,
        token
      );
      return response?.users;
    },
    enabled: !!user,
  });

  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      try {
        const parsedNotifications = JSON.parse(storedNotifications);
        if (Array.isArray(parsedNotifications)) {
          setNotifications(parsedNotifications);
        } else {
          console.error("Parsed notifications are not an array.");
        }
      } catch (e) {
        console.error("Failed to parse notifications from localStorage:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (Array.isArray(notifications) && notifications.length > 0) {
      const unreadNotification = notifications.filter(
        (n) =>
          Object.prototype.hasOwnProperty.call(n, "chatId") &&
          n.isRead === false &&
          userChats?.some((chat) => chat.chatId === n.chatId)
      );
      const jsonValue = JSON.stringify(unreadNotification);
      localStorage.setItem("notifications", jsonValue);
    }
  }, [notifications, userChats]);

  useEffect(() => {
    localStorage.setItem("recipientId", recipientId);
    const userDetails = users?.find(
      (userItem) => userItem._id.toString() === recipientId
    );
    setSelectedUser(userDetails || null);
  }, [recipientId, users]);

  useEffect(() => {
    if (socket) {
      socket?.on("getMessage", (message) => {
        if (chatId === message.chatId && message.sender === recipientId) {
          setMessages((prevMessages) => {
            return prevMessages
              ? [...prevMessages, message]
              : [message];
          });
        }
      });

      socket?.on("calling", ({ chatId, callerId, callType, receiver }) => {
        if (receiver === user?._id) {
          setCallNotification({ chatId, callerId, callType });
        }
      });
      socket?.on("calling_group", ({ chatId, callerId, callType }) => {
        if (callerId !== user?._id) {
          setCallNotification({ chatId, callerId, callType });
        }
      });
      socket?.on("ending", ({ chatId, callerId, action, receiver }) => {
        if (receiver === user?._id) {
          setEndCallNotification({ chatId, callerId, action });
        }
      });
      socket?.on("ending_group", ({ chatId, callerId, action }) => {
        if (callerId !== user?._id) {
          setEndCallNotification({ chatId, callerId, action });
        }
      });

      socket?.on("getNotifications", async (response) => {
        if (response.chatId !== chatId) {
          const audio = new Audio(notificationSound);
          audio.play().catch((error) => {
            console.error("Error playing notification sound:", error);
          });
          toast({
            title: "New message",
            description: `Message: ${response.text}`,
            duration: 1000,
          });
        }
        setNotifications((prev) =>
          prev
            ? [{ ...response, isRead: response.chatId === chatId }, ...prev]
            : [response]
        );
      });

      socket.on("getGroupMessage", (message) => {
        if (chatId === message.chatId && user?._id !== message.sender) {
          setMessages((prevMessages) =>
            prevMessages ? [...prevMessages, message] : [message]
          );
        }
      });

      socket?.on("getGroupNotifications", (response) => {
        if (response.chatId !== chatId) {
          const audio = new Audio(groupNotificationSound);
          audio.play().catch((error) => {
            console.error("Error playing notification sound:", error);
          });
          toast({
            title: "New message",
            description: `Message: ${response.text}`,
            duration: 1000,
            action: (
              <Button
                onClick={() => {
                  dismiss();
                  navigate(`/channels/${response.chatId}`);
                }}
                variant={"outline"}
              >
                Open
              </Button>
            ),
          });
        }
        setNotifications((prev) =>
          prev
            ? [{ ...response, isRead: response.chatId === chatId }, ...prev]
            : [response]
        );
      });

      // socket.on('newChat',async () => {
      //   await getUserChats()
      // });

      return () => {
        socket.off("getMessage");
        socket.off("getGroupMessage");
        socket.off("getNotifications");
        socket.off("getGroupNotifications");
        socket.off("calling");
        socket.off("calling_group");
        socket.off("ending");
        socket.off("ending_group");
      };
    }
  }, [socket, recipientId, chatId, newMessage, user]);

  const getUserChats = async () => {
    if (user?._id) {
      const response = await getRequest(`${baseUrl}/chats/`, token);

      const userChatsWithIds: UserChatWithId[] = response.chats
        ?.filter((chat: UserChat) => chat.type === "direct")
        .map((chat: UserChat) => {
          const otherMemberId = chat.members.find(
            (memberId) => memberId !== user._id
          );
          const userDetail = users?.find(
            (userItem) => userItem._id.toString() === otherMemberId
          );
          return userDetail ? { user: userDetail, chatId: chat._id } : null;
        })
        .filter(Boolean) as UserChatWithId[];

      const userGroupChatsWithIds: UserGroupChatWithId[] = response.chats
        ?.filter(
          (chat: UserChat) => chat.type === "course" || chat.type === "group"
        )
        ?.map((chat: UserChat) => {
          const otherMembersId = chat.members?.filter(
            (memberId) => memberId !== user._id
          );
          const courseId = chat.courses[0];
          const userDetails = otherMembersId
            ?.map((memberId) =>
              users?.find(
                (userItem) => userItem._id.toString() === memberId.toString()
              )
            )
            ?.filter(Boolean) as UserProps[];
          return userDetails.length > 0
            ? {
                users: userDetails,
                chatId: chat._id,
                name: chat.name,
                courseId,
                owner: chat.owner,
              }
            : null;
        })
        .filter(Boolean) as UserGroupChatWithId[];

      const potentialChats = users?.filter(
        (userItem) =>
          !userChatsWithIds
            .map((chat) => chat.user?._id)
            .includes(userItem._id.toString())
      );

      return {
        userChats: userChatsWithIds,
        potentialChats,
        userGroupChats: userGroupChatsWithIds,
      };
    }
  };

  const { data: userChatsData, isLoading: isLoadingUserChats } = useQuery({
    queryKey: ["userChats"],
    queryFn: getUserChats,
    enabled: !!user && !!users,
  });

  useEffect(() => {
    if (userChatsData) {
      setUserChats(userChatsData.userChats);
      setPotentialChats(userChatsData.potentialChats!);
      setUserGroupChats(userChatsData.userGroupChats);
    }
  }, [userChatsData]);

  const getMessages = async (chatId: string) => {
    if (user) {
      const response = await getRequest(
        `${baseUrl}/chats/${chatId}/messages?latest=false`,
        token
      );

      return response?.messages
    }
  };

  const fetchMoreMessages = useCallback(
    async (setScrollLoading: Dispatch<SetStateAction<boolean>>) => {
      if (!chatId || !hasMore) {
        return;
      }
      console.log("scroll", hasMore);

      setScrollLoading(true);
      try {
        const response = await getRequest(
          `${baseUrl}/chats/${chatId}/messages?page=${page}&limit=5`,
          token
        );
        if (response.messages.length > 0) {
          setMessages((prev) => [...(prev || []), ...response.messages]);
          setPage((prev) => prev + 1);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setScrollLoading(false);
      }
    },
    [chatId, page, hasMore]
  );

  const manageCourseChats = useMutation({
    mutationFn: async () => {
      const response = await postRequest(
        `${baseUrl}/chats/manage-course-chats`,
        token,
        undefined
      );
      if (response.error) {
        toast({
          title: "Something went wrong",
          description: response.message,
          duration: 2000,
          variant: "destructive",
        });
        throw new Error(response.message);
      }
      return response;
    },
    onError: (error: Error) => {
      console.log("Error managing course chats", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
    },
  });

  useEffect(() => {
    if (user) {
      manageCourseChats.mutate();
    }
  }, [user]);

  useEffect(() => {
    const recipient = pathname.match(/\/direct-messages\/([^/]+)/);
    const group = pathname.match(/\/channels\/([^/]+)/);
    if (recipient) {
      setRecipientId(recipient[1]);
    }
    if (group) {
      setChatId(group[1]);
      const channel = userGroupChats?.filter(
        (chat) => chat.chatId === group[1]
      );
      if (channel) {
        setChannel(channel[0]);
      } else {
        // navigate("/channels");
      }
    }
  }, [pathname, userGroupChats]);

  useEffect(() => {
    if (chatId) {
      const channel = userGroupChats?.filter((chat) => chat.chatId === chatId);
      if (channel) {
        setChannel(channel[0]);
      }
    }
  }, [chatId, userGroupChats]);

  const sendTextMessageMutation = useMutation({
    mutationFn: async ({
      textMessage,
      type,
      currentChatId,
      tempMessageId,
    }: {
      textMessage: string;
      type: "text" | "document" | "audio" | "video" | "image";
      currentChatId: string;
      tempMessageId: string;
    }) => {
      const tempMessage: Message = {
        _id: tempMessageId,
        chatId: currentChatId,
        sender: user?._id as string,
        text: textMessage,
        createdAt: new Date(),
        sending: true,
        error: false,
        type: type || "text",
      };

      setMessages((prev: Message[] | null) =>
        prev ? [...prev, tempMessage] : [tempMessage]
      );
      const response = await postRequest(
        `${baseUrl}/message/send-message`,
        token,
        JSON.stringify(tempMessage)
      );
      if (response.error) {
        toast({
          title: "Something went wrong",
          description: response.message,
          duration: 2000,
          variant: "destructive",
        });
        throw new Error(response.message);
      }
      return response.response;
    },
    onSuccess: (newText) => {
      const newMessage = {
        _id: newText._id,
        chatId: newText.chatId,
        sender: newText.sender,
        text: newText.text,
        createdAt: newText.createdAt,
        courseId: newText.course,
        type: newText.type,
      };
      queryClient.invalidateQueries({ queryKey: ["latestMessage"] });
      socket?.emit(newMessage?.courseId ? "sendGroupMessage" : "sendMessage", {
        ...newMessage,
        recipientId,
      });
      setNewMessage(newMessage);
      setMessages((prev: Message[] | null) =>
        prev
          ? prev.map((msg) => (msg._id === newText._id ? newMessage : msg))
          : [newMessage]
      );
    },
    onError: (error, variables) => {
      setSendTextMessageError(error.message);
      setMessages((prev: Message[] | null) =>
        prev
          ? prev.map((msg) =>
              msg._id === variables.tempMessageId
                ? { ...msg, sending: false, error: true }
                : msg
            )
          : null
      );
    },
  });

  const sendTextMessage = useCallback(
    async (
      textMessage: string,
      type: "text" | "document" | "audio" | "video" | "image",
      currentChatId: string,
      tempMessageId: string
    ) => {
      try {
        setSendMessageLoading((prev) => ({ ...prev, [tempMessageId]: true }));
        if (!textMessage) {
          console.error("No text message");
          return;
        }

        await sendTextMessageMutation.mutateAsync({
          textMessage,
          type,
          currentChatId,
          tempMessageId,
        });
      } finally {
        setSendMessageLoading((prev) => ({ ...prev, [tempMessageId]: false }));
      }
    },
    []
  );

  const retrySendMessageMutation = useMutation({
    mutationFn: async (message: Message) => {
      const response = await postRequest(
        `${baseUrl}/message/send-message`,
        token,
        JSON.stringify(message)
      );
      if (response.error) {
        toast({
          title: "Something went wrong",
          description: response.message,
          duration: 2000,
          variant: "destructive",
        });
        throw new Error(response.message);
      }
      return response.response;
    },
    onMutate: (message: Message) => {
      const tempMessageId = message._id;
      setMessages((prev: Message[] | null) =>
        prev
          ? prev.map((msg) => {
              return msg._id === tempMessageId
                ? { ...msg, sending: true, error: false }
                : msg;
            })
          : null
      );
    },
    onSuccess: (response) => {
      const newText = response;
      const newMessage = {
        chatId: newText.chatId,
        sender: newText.sender,
        text: newText.text,
        createdAt: newText.createdAt,
        courseId: newText.course,
        type: newText.type,
      };
      if (socket) {
        socket.emit("sendMessage", {
          ...newMessage,
          recipientId,
        });
      }
      setNewMessage(newMessage);
      setMessages((prev: Message[] | null) =>
        prev
          ? prev.map((msg) => (msg._id === newText._id ? newMessage : msg))
          : [newMessage]
      );
      queryClient.invalidateQueries({
        queryKey: ["latestMessage", newText.chatId],
      });
    },
    onError: (error: Error, message: Message) => {
      console.error("Send Text Message Error:", error, message);
      const tempMessageId = message._id;
      setSendTextMessageError(error.message);
      setMessages((prev: Message[] | null) =>
        prev
          ? prev.map((msg) =>
              msg._id === tempMessageId
                ? { ...msg, sending: false, error: true }
                : msg
            )
          : null
      );
    },
  });

  const retrySendMessage = useCallback(
    (message: Message) => {
      try {
        setSendMessageLoading((prev) => ({
          ...prev,
          [message._id as string]: true,
        }));
        if (!message || !message._id) {
          console.error("Invalid message object:", message);
          return;
        }
        retrySendMessageMutation.mutate(message);
      } finally {
        setSendMessageLoading((prev) => ({
          ...prev,
          [message._id as string]: false,
        }));
      }
    },
    [retrySendMessageMutation]
  );

  const markAsRead = useCallback(
    (chatId: string, notifications: Notifications[]) => {
      const updatedNotifications = notifications.map((notification) =>
        notification.chatId === chatId
          ? { ...notification, isRead: true }
          : notification
      );
      setNotifications(updatedNotifications);
    },
    []
  );

  const upload = useCallback(async (file: File) => {
    console.log(file)
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(`${baseUrl}/uploads`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        return console.log("Error uploading file", response);
      }
      return await response.json();
    } catch (error) {
      console.log(error);
    }
  }, []);

  const value: ChatContextProps = {
    userChats,
    potentialChats,
    recipientId,
    setRecipientId,
    selectedUser,
    setSelectedUser,
    sendTextMessage,
    messages,
    setChatId,
    chatId,
    userGroupChats,
    channel,
    sendTextMessageError,
    notifications,
    markAsRead,
    upload,
    retrySendMessage,
    fetchMoreMessages,
    setChannel,
    users: users || [],
    sendMessageLoading,
    isLoadingUserChats,
    setMessages,
    newMessage,
    getMessages,
    messageLoading,
    setMessageLoading,
    callNotification,
    setCallNotification,
    endCallNotification,
    setEndCallNotification,
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
