import React from "react";
import * as Notifications from "expo-notifications"
import {
  Message,
  Notification,
  UploadResponse,
  UserChat,
  UserChatWithId,
  UserGroupChatWithId,
  UserProps,
} from "@/types";
import { baseUrl, getRequest, postRequest } from "@/utils/service";
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
import { usePathname } from "expo-router";
import { useSocket } from "./SocketContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Recording } from "expo-av/build/Audio";
import { Audio } from "expo-av";
import { router } from 'expo-router';
import { initialNotifications } from "@/lib/notifications";

interface ChatContextProps {
  userChats: UserChatWithId[] | null;
  potentialChats: UserProps[] | null;
  recipientId: string | null;
  selectedUser: UserProps | null;
  setRecipientId: Dispatch<SetStateAction<string | null>>;
  setSelectedUser: Dispatch<SetStateAction<UserProps | null>>;
  setChannel: Dispatch<SetStateAction<UserGroupChatWithId | null>>;
  setMessageLoading: Dispatch<SetStateAction<boolean>>;
  messageLoading: boolean;
  sendTextMessage: (
    textMessage: string,
    type: "text" | "document" | "audio" | "video" | "image",
    currentChatId: string,
    tempMessageId: string
  ) => void;
  retrySendMessage: (message: Message) => void;
  messages: Message[] | null;
  setMessages: Dispatch<SetStateAction<Message[] | null>>;
  setChatId: Dispatch<SetStateAction<string | null>>;
  chatId: string | null;
  userGroupChats: UserGroupChatWithId[] | null;
  channel: UserGroupChatWithId | null;
  sendTextMessageError: string;
  notifications: Notification[];
  markAsRead: (chatId: string, notifications: Notification[]) => void;
  upload: (file: File) => Promise<UploadResponse | null>;
  fetchMoreMessages: (
    setScrollLoading: Dispatch<SetStateAction<boolean>>
  ) => void;
  users: UserProps[];
  sendMessageLoading: { [key: string]: boolean };
  isLoadingUserChats: boolean;
  newMessage: Message | null;
  getMessages: (chatId: string) => Promise<Message[]>;
  recordedAudio: string | null
  setRecordedAudio: Dispatch<
    SetStateAction<string | null>
  >;
  recording: Recording | null
  setRecording: Dispatch<SetStateAction< Recording | null>>
  currentSound: Audio.Sound | null;
  setCurrentSound: React.Dispatch<React.SetStateAction<Audio.Sound | null>>;
  showCamera: boolean
  setShowCamera: Dispatch<SetStateAction<boolean>>
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
  users: [],
  sendMessageLoading: {},
  isLoadingUserChats: false,
  setMessages: () => null,
  newMessage: null,
  getMessages: () => Promise.resolve([]),
  setMessageLoading: () => null,
  messageLoading: false,
  recordedAudio: null,
  setRecordedAudio: () => {},
  recording: null,
  setRecording: () => null,
  currentSound: null,
  setCurrentSound: () => {},
  showCamera: false,
  setShowCamera: () => null
});

export const useChat = () => {
  return useContext(ChatContext);
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [userChats, setUserChats] = useState<UserChatWithId[] | null>(null);
  const [recipientId, setRecipientId] = useState<string | null>(null);
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
  const [chatId, setChatId] = useState<string | null>(null);
  const [channel, setChannel] = useState<UserGroupChatWithId | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sendMessageLoading, setSendMessageLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [messageLoading, setMessageLoading] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [showCamera, setShowCamera] = useState(false)
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const queryClient = useQueryClient();

  const { socket } = useSocket();
  const { user, token } = useAuth();
  const pathname = usePathname();
  
  const { data: users } = useQuery({
    queryKey: ["users", user?._id],
    queryFn: async () => {
      const response: { users: UserProps[] } = await getRequest(
        `${baseUrl}/api/users`,
        token
      );
      return response?.users;
    },
    enabled: !!user,
  });

  useEffect(() => {
    let isMounted = true;

    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (url) {
        router.push(url);
      }
    }

    Notifications.getLastNotificationResponseAsync()
      .then(response => {
        if (!isMounted || !response?.notification) {
          return;
        }
        redirect(response?.notification);
      });

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      redirect(response.notification);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
  const loadNotifications = async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem("notifications");
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  loadNotifications();
}, []);


useEffect(() => {
  const persistNotifications = async () => {
    try {
      const unreadNotification = notifications.filter(
        (n) =>
          Object.prototype.hasOwnProperty.call(n, "chatId") &&
          n.isRead === false &&
          (userChats?.some((chat) => chat.chatId === n.chatId) ||
            userGroupChats?.some((chat) => chat.chatId === n.chatId))
      );
      const jsonValue = JSON.stringify(unreadNotification);
      await AsyncStorage.setItem("notifications", jsonValue);
    } catch (error) {
      console.error("Error saving notifications:", error);
    }
  };

  if (notifications.length > 0) {
    persistNotifications();
  }
}, [notifications, userChats, userGroupChats]);

  useEffect(() => {
    const userDetails = users?.find(
      (userItem) => userItem._id.toString() === recipientId
    );
    setSelectedUser(userDetails || null);
  }, [recipientId, users]);

  useEffect(() => {
    const chat = userGroupChats?.find((chat) => chat.chatId === chatId);
    if (chat) {
      setChannel(chat);
    }
  }, [chatId, userGroupChats]);

  useEffect(() => {
    if (socket) {
      socket?.on("getMessage", (message: Message) => {
        if (chatId === message.chatId && message.sender === recipientId) {
          setMessages((prevMessages) => {
            return prevMessages
              ? [...prevMessages, message]
              : [message];
          });
        }
      });

      socket.on("newChat", () => {
        queryClient.invalidateQueries({ queryKey: ["userChats"] });
      });

      socket?.on("getNotifications", (response) => {
        if(pathname !== `/direct-messages/${response.chatId}` ||
          pathname !== `/channels/${response.chatId}`){
            initialNotifications()
            const sender = users?.find(user=>user._id === response.sender)
            Notifications.scheduleNotificationAsync({
              content: {
                title: `${sender?.firstName} ${sender?.lastName}`,
                body: response.message,
                data: {url: `/direct-messages` }
              },
              trigger: null,
            });
          }
        setNotifications((prev) =>
          prev
            ? [
                {
                  ...response,
                  isRead:
                    pathname === `/direct-messages/${response.chatId}` ||
                    pathname === `/channels/${response.chatId}`,
                },
                ...prev,
              ]
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
        if(pathname !== `/direct-messages/${response.chatId}` ||
          pathname !== `/channels/${response.chatId}`){
            initialNotifications()
            const sender = users?.find(user=>user._id === response.sender)
            const chat = userGroupChats?.find(chat=>chat.chatId === response.chatId)
            Notifications.scheduleNotificationAsync({
              content: {
                title: `${sender?.firstName} ${sender?.lastName} in ${chat?.name}`,
                body: response.message,
                data: {url: `/channels` }
              },
              trigger: null,

            });
          }
        setNotifications((prev) =>
          prev
            ? [
                {
                  ...response,
                  isRead:
                    pathname === `/direct-messages/${response.chatId}` ||
                    pathname === `/channels/${response.chatId}`,
                },
                ...prev,
              ]
            : [response]
        );
      });

      return () => {
        socket.off("getMessage");
        socket.off("getGroupMessage");
        socket.off("getNotifications");
        socket.off("getGroupNotifications");
        socket.off("newChat");
      };
    }
  }, [socket, recipientId, chatId, user, pathname]);

  const getUserChats = async () => {
    if (user?._id) {
      const response = await getRequest(`${baseUrl}/api/chats/`, token);

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
        ?.filter((chat: UserChat) => chat.type === "course" || chat.type === "group")
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
                owner: chat.owner,
                courseId,
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

  const manageCourseChats = useMutation({
    mutationFn: async () => {
      const response = await postRequest(
        `${baseUrl}/api/chats/manage-course-chats`,
        token,
        undefined
      );
      if (response.error) {
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
    manageCourseChats.mutate();
  }, []);

  const getMessages = async (chatId: string) => {
    if (user) {
      const response = await getRequest(
        `${baseUrl}/api/chats/${chatId}/messages?latest=false`,
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
      console.log("fetch more messages", hasMore);

      setScrollLoading(true);
      try {
        const response = await getRequest(
          `${baseUrl}/api/chats/${chatId}/messages?page=${page}&limit=5`,
          token
        );
        if (response.messages.length > 0) {
          setMessages((prev) => [...(prev || []), ...response.messages]);
          setPage((prev) => prev + 1);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.log("fetch more messages error", error);
      } finally {
        setScrollLoading(false);
      }
    },
    [chatId, page, hasMore]
  );

  useEffect(() => {
    getUserChats();
  }, [users, getUserChats]);

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
        `${baseUrl}/api/message/send-message`,
        token,
        JSON.stringify(tempMessage)
      );
      if (response.error) {
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
      if (socket) {
        socket.emit("sendMessage", {
          ...newMessage,
          recipientId,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["latestMessage"] });

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
    [user, sendTextMessageMutation]
  );

  const retrySendMessageMutation = useMutation({
    mutationFn: async (message: Message) => {
      const response = await postRequest(
        `${baseUrl}/api/message/send-message`,
        token,
        JSON.stringify(message)
      );
      if (response.error) {
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
          ? prev.map((msg) => (msg._id === newText._id ? newMessage: msg))
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
    (chatId: string, notifications: Notification[]) => {
      const updatedNotifications = notifications
        .map((notification) =>
          notification.chatId === chatId
            ? { ...notification, isRead: true }
            : notification
        )
        .filter((notification) => !notification.isRead);
      setNotifications(updatedNotifications);
    },
    []
  );

  const upload = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      console.log(formData);
      const response = await fetch(`${baseUrl}/api/uploads`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("response",response)
      if (!response.ok) {
        return console.log("Error uploading file", response);
      }
      return await response.json();
    } catch (error) {
      console.log("Error uploading file", error);
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
    setRecordedAudio,
    recordedAudio,
    recording, setRecording,  currentSound, setCurrentSound, showCamera, setShowCamera
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
