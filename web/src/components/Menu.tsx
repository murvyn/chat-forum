import { Ellipsis } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useChat } from "@/contexts/ChatContext";
import { UserChat } from "@/types";
import { lazy, Suspense, useCallback } from "react";
import { Skeleton } from "./ui/skeleton";
import ErrorBoundary from "./ErrorBoundary";
import ErrorFallback from "./ErrorFallBack";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseUrl, postRequest } from "@/utils/services";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/contexts/AuthContext";
import { FaPaperPlane, FaUsers } from "react-icons/fa";
import { useSortedChats } from "@/hooks/useFetchLastMessage";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";

const CollapseMenuButton = lazy(() => import("./CollapseMenuButton"));

interface MenuProps {
  isOpen: boolean | undefined;
}

export function Menu({ isOpen }: MenuProps) {
  const {
    userChats,
    potentialChats,
    userGroupChats,
    setRecipientId,
    setChatId,
  } = useChat();
  const { socket } = useSocket();
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  const sortedUserGroupChats = useSortedChats(userGroupChats || []);
  const sortedUserChats = useSortedChats(userChats || []);

  const createChat = useMutation({
    mutationFn: async (secondId: string) => {
      const response = await postRequest(
        `${baseUrl}/chats/create-direct-chat/${secondId}`,
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
      if (socket) {
        socket.emit("new-direct-chat", {
          senderId: user?._id,
          recipientId: secondId,
        });
      }
      return response.chat;
    },
    onError: (error: Error) => {
      console.log("Error creating chat", error);
    },
    onSuccess: (chat: UserChat) => {
      setChatId(chat._id);
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
    },
  });

  const handlePress = useCallback(async (recipientId: string) => {
    try {
      await createChat.mutateAsync(recipientId);
      setRecipientId(recipientId);
      navigate(`/direct-messages/${recipientId}`);
    } catch (error) {
      console.log("Error pressing user", error);
    }
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ScrollArea className="[&>div>div[style]]:!block max-sm:h-[80vh] overflow-y-auto">
        <nav className="justify-between flex flex-col w-full md:mt-5">
          <div className="flex flex-col items-start space-y-1 px-2">
            {/* <Button
              onClick={() => navigate("/general-feed")}
              variant={pathname === "/general-feed" ? "secondary" : "ghost"}
              className="w-full justify-start h-10"
            >
              <div className="w-full items-center flex justify-between">
                <div className="flex items-center">
                  <span className="mr-4">
                    <FaInbox size={18} />
                  </span>
                  <p
                    className={cn(
                      "max-w-[150px] truncate",
                      isOpen
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-96 opacity-0"
                    )}
                  >
                    General Feed
                  </p>
                </div>
              </div>
            </Button> */}
            <div className={cn("w-full", "pt-5")}>
              <p className="text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
                Messages
              </p>
              <div className="w-full">
                <Suspense
                  fallback={
                    <div className="flex items-center gap-4 mb-5">
                      <Skeleton className="h-12 w-12 rounded-full bg-neutral-200" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px] bg-neutral-200" />
                        <Skeleton className="h-4 w-[150px] bg-neutral-200" />
                      </div>
                    </div>
                  }
                >
                  <CollapseMenuButton
                    icon={FaUsers}
                    label={"Channels"}
                    active={false}
                    users={sortedUserGroupChats || []}
                    isOpen={isOpen}
                    isChannel
                  />
                </Suspense>
              </div>
              <div className="w-full">
                <Suspense
                  fallback={
                    <div className="flex items-center gap-4 mb-5">
                      <Skeleton className="h-12 w-12 rounded-full bg-neutral-200" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px] bg-neutral-200" />
                        <Skeleton className="h-4 w-[150px] bg-neutral-200" />
                      </div>
                    </div>
                  }
                >
                  <CollapseMenuButton
                    icon={FaPaperPlane}
                    label={"Direct Messages"}
                    active={false}
                    users={sortedUserChats || []}
                    isOpen={isOpen}
                  />
                </Suspense>
              </div>
            </div>
            {userChats?.length === 0 && (
              <li className="w-full flex justify-center items-center">
                <p className="text-muted-foreground">
                  No chats available. Start a chat below.
                </p>
              </li>
            )}
            {potentialChats && potentialChats.length > 0 && (
              <div className="w-full pt-5">
                <p className="text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
                  Potential Chats
                </p>
                <div className="max-h-96 overflow-y-auto">
                  {potentialChats.map((user) => (
                    <div className="w-full " key={user._id}>
                      <TooltipProvider disableHoverableContent>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-start h-10 mb-1"
                              onClick={() => handlePress(user._id)}
                            >
                              <span
                                className={cn(isOpen === false ? "" : "mr-4")}
                              >
                                <Ellipsis size={18} />
                              </span>
                              <p
                                className={cn(
                                  "max-w-[200px] truncate",
                                  isOpen === false
                                    ? "-translate-x-96 opacity-0"
                                    : "translate-x-0 opacity-100"
                                )}
                              >
                                {`${user.firstName} ${user.lastName}`}
                              </p>
                            </Button>
                          </TooltipTrigger>
                          {isOpen === true && (
                            <TooltipContent side="right">{`${user.firstName} ${user.lastName}`}</TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>
      </ScrollArea>
    </ErrorBoundary>
  );
}
