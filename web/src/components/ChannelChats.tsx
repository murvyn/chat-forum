import { useEffect, useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "./ui/button";
import { Link, useLocation } from "react-router-dom";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { Message } from "@/types";
import { useChat } from "@/contexts/ChatContext";
import { getFormattedTime, unreadNotification } from "@/utils/helpers";
import LatestMessage from "./LatestMessage";
import { useMutation } from "@tanstack/react-query";
import { Hash } from "lucide-react";

interface Props {
  chatId: string;
  name: string;
  latestMessage: Message;
}

const ChannelChats = ({ chatId, name, latestMessage }: Props) => {
  const {
    setChatId,
    notifications,
    markAsRead,
    userGroupChats,
    setChannel,
    getMessages,
    setMessages,
    setMessageLoading,
  } = useChat();
  const { pathname } = useLocation();

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
      console.error(error);
    },
  });

  const handlePress = () => {
    if (chatId) {
      setChatId(chatId);
      messagesMutation.mutate(chatId);
      const channel = userGroupChats?.filter((chat) => chat.chatId === chatId);
      if (channel) {
        setChannel(channel[0]);
      }
    }
    if (chatsNotifications?.length > 0) {
      markAsRead(chatId as string, notifications);
    }
  };

  useEffect(() => {
    setMessageLoading(messagesMutation.isPending);
  }, [messagesMutation.isPending]);

  return (
    <TooltipProvider disableHoverableContent>
      <Tooltip delayDuration={100}>
        <TooltipTrigger className="w-full">
          <Button
            variant={pathname === `/channels/${chatId}` ? "secondary" : "ghost"}
            className="w-full justify-start h-auto mb-1 text-gray-600"
            asChild
            onClick={handlePress}
          >
            <div>
              <Link to={`/channels/${chatId}`} className="w-full">
                <div className="flex flex-row items-center w-full">
                  <span className="relative mr-4 ml-2">
                    <Avatar className="flex justify-center items-center">
                      <Hash size={18} />
                    </Avatar>
                  </span>
                  <div className="flex flex-col items-start w-full">
                    <div className="flex flex-row w-full items-center justify-between">
                      <p
                        className={cn(
                          "max-w-[100px] truncate",
                          "translate-x-0 opacity-100"
                        )}
                      >
                        {name}
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
            {latestMessage ? <LatestMessage message={latestMessage} /> : name}
          </TooltipContent>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ChannelChats;
