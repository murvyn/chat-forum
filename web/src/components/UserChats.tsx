import { useEffect, useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "./ui/button";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { Message, UserProps } from "@/types";
import { useSocket } from "@/contexts/SocketContext";
import { useChat } from "@/contexts/ChatContext";
import {
  getFormattedTime,
  getInitials,
  unreadNotification,
} from "@/utils/helpers";
import LatestMessage from "./LatestMessage";
import { useMutation } from "@tanstack/react-query";

interface Props {
  chatId: string;
  user: UserProps;
  label: string;
  latestMessage: Message | null;
}

const UserChats = ({ chatId, user, label, latestMessage }: Props) => {
  const {
    setRecipientId,
    setChatId,
    setSelectedUser,
    notifications,
    markAsRead,
    userGroupChats,
    setChannel,
    getMessages,
    setMessages,
    setMessageLoading,
  } = useChat();
  const { onlineUsers } = useSocket();
  const { pathname } = useLocation();

  const isOnline = useMemo(
    () => onlineUsers.some((onlineUser) => onlineUser.userId === user?._id),
    [onlineUsers, user]
  );

  const chatsNotifications = useMemo(
    () => unreadNotification(notifications)?.filter((n) => n.chatId === chatId),
    [notifications, chatId]
  );

  const messagesMutation = useMutation({
    mutationFn: (id: string) => getMessages(id!),
    onSuccess: (data) => {
      setMessages(data);
    },
    onError: (error) => {
      console.error("Error fetching messages:", error);
    },
  });

  const handlePress = () => {
    setRecipientId(user._id as string);
    if (chatId) {
      setChatId(chatId);
      messagesMutation.mutate(chatId);
      const channel = userGroupChats?.filter((chat) => chat.chatId === chatId);
      if (channel) {
        setChannel(channel[0]);
      }
    }
    if (user) {
      setSelectedUser(user);
    }
    if (chatsNotifications) {
      markAsRead(chatId as string, notifications);
    }
  };

  useEffect(() => {
    setMessageLoading(messagesMutation.isPending);
  }, [messagesMutation.isPending]);

  const initials = getInitials(user.firstName, user.lastName);

  return (
    <TooltipProvider disableHoverableContent>
      <Tooltip delayDuration={100}>
        <TooltipTrigger className="w-full">
          <Button
            variant={
              pathname === `/direct-messages/${user?._id}`
                ? "secondary"
                : "ghost"
            }
            className="w-full justify-start h-auto mb-1 text-gray-600"
            asChild
            onClick={handlePress}
          >
            <div>
              <Link to={`/direct-messages/${user?._id}`} className="w-full">
                <div className="flex flex-row items-center w-full">
                  <span className="relative mr-4 ml-2">
                    <Avatar className="flex justify-center items-center">
                      <AvatarImage
                        className="w-full object-cover"
                        src={user.photoUrl}
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 bg-green-500 border-2 text-xs text-white border-white rounded-full w-4 h-4 flex items-center justify-center" />
                    )}
                  </span>
                  <div className="flex flex-col items-start w-full">
                    <div className="flex flex-row w-full items-center justify-between">
                      <p
                        className={cn(
                          "max-w-[100px] truncate",
                          "translate-x-0 opacity-100"
                        )}
                      >
                        {label}
                      </p>
                      {chatsNotifications.length > 0 && (
                        <span>
                          <Badge className="">
                            {chatsNotifications.length}
                          </Badge>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-center font-light">
                      <span
                        className={`${
                          latestMessage ? "truncate" : ""
                        } max-w-[4rem] text-start`}
                      >
                        {latestMessage ? (
                          <LatestMessage message={latestMessage} />
                        ) : (
                          "No conversation"
                        )}
                      </span>

                      <span className="ml-1 w-auto">
                        {latestMessage
                          ? `~ ${getFormattedTime(latestMessage?.createdAt)}`
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </Button>
          <TooltipContent
            side="right"
            align="start"
            className="max-w-lg text-start"
          >
            {latestMessage ? <LatestMessage message={latestMessage} /> : label}
          </TooltipContent>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UserChats;
