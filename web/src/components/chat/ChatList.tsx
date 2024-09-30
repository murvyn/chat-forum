import { useRef, useEffect } from "react";
import ChatBottomBar from "./ChatBottomBar";
import { useChat } from "@/contexts/ChatContext";
import { getFormattedTime, getInitials } from "@/utils/helpers";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "../spinner";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import MessageComponent from "../MessageComponent";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
} from "./chat-bubble";
import { FaLock } from "react-icons/fa";

const getMessageVariant = (isUser: boolean) => (isUser ? "sent" : "received");

export function ChatList() {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const {
    messageLoading,
    retrySendMessage,
    chatId,
    messages,
    users,
    getMessages,
    setMessages,
    sendMessageLoading,
  } = useChat();
  const { user } = useAuth();
  const userInitials = getInitials(
    user?.firstName as string,
    user?.lastName as string
  );

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const messagesMutation = useMutation({
    mutationFn: (id: string) => getMessages(id!),
    onSuccess: (data) => {
      setMessages(data);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  useEffect(() => {
    if (chatId) {
      messagesMutation.mutate(chatId);
    }

    return () => {
      messagesMutation.reset();
    };
  }, [chatId]);

  return (
    <div className="w-full  overflow-y-hidden overflow-x-hidden h-full flex flex-col">
      {messageLoading ? (
        <div className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col justify-center">
          <Spinner />
        </div>
      ) : (
        <div
          ref={messagesContainerRef}
          className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col"
        >
          <div className=" flex justify-center mt-3 ">
            <div className="bg-green-200 flex text-xs text-muted-foreground rounded-md p-2 items-center space-x-1">
              <FaLock />
              <p>Messages are end-to-end encrypted</p>
            </div>
          </div>
          {messages && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              No conversation
            </div>
          ) : (
            <AnimatePresence>
              {messages?.map((message) => {
                const formattedTime = getFormattedTime(message.createdAt);
                const sender =
                  users && users?.find((user) => user._id === message.sender);
                const selectedUserInitials = getInitials(
                  sender?.firstName as string,
                  sender?.lastName as string
                );
                const isCurrentUser = message.sender === user?._id;
                if (!message._id) {
                  return null;
                }
                const isSending = sendMessageLoading[message._id] || false;
                const variant = getMessageVariant(isCurrentUser);
                return (
                  <motion.div
                    key={message._id}
                    layout
                    initial={{ opacity: 0, scale: 1, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1, y: 10 }}
                    transition={{
                      opacity: { duration: 0.1 },
                      layout: {
                        type: "spring",
                        bounce: 0.3,
                        duration: 0.2,
                      },
                    }}
                    className="flex flex-col gap-2 p-4"
                  >
                    <ChatBubble variant={variant}>
                      <ChatBubbleAvatar
                        fallback={
                          isCurrentUser ? userInitials : selectedUserInitials
                        }
                        src={isCurrentUser ? user.photoUrl : sender?.photoUrl}
                      />
                      {message.error && (
                        <button
                          onClick={() => retrySendMessage(message)}
                          className="text-rose-600 hover:text-rose-800"
                          title="Retry sending message"
                        >
                          <AiOutlineExclamationCircle size={20} />
                        </button>
                      )}
                      <ChatBubbleMessage
                        className=""
                        isMedia={
                          message.type === "image" || message.type === "video"
                        }
                        variant={variant}
                        isLoading={isSending}
                      >
                        <div className="w-full">
                          <MessageComponent
                            type={message.type}
                            text={message.text}
                          />
                        </div>
                        {formattedTime && (
                          <ChatBubbleTimestamp timestamp={formattedTime} />
                        )}
                      </ChatBubbleMessage>
                    </ChatBubble>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      )}
      <ChatBottomBar />
    </div>
  );
}
