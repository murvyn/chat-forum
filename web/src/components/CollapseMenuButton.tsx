import { ChevronDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { UserChatWithId, UserGroupChatWithId, UserProps } from "@/types";
import UserChats from "./UserChats";
import ChannelChats from "./ChannelChats";
import { IconType } from "react-icons/lib";
import CreateChannelCard from "./CreateChannelCard";

interface CollapseMenuButtonProps {
  icon: IconType | LucideIcon;
  label: string;
  active: boolean;
  users: UserChatWithId[] | UserGroupChatWithId[];
  isOpen: boolean | undefined;
  isChannel?: boolean;
}

const CollapseMenuButton = ({
  icon: Icon,
  label,
  active,
  users,
  isOpen,
  isChannel,
}: CollapseMenuButtonProps) => {
  return (
    <Collapsible defaultOpen className="w-full">
      <div className="flex">
        <CollapsibleTrigger
          className="[&[data-state=open]>div>div>svg]:rotate-180 mb-1"
          asChild
        >
          <Button
            variant={active ? "secondary" : "ghost"}
            className="w-full justify-start h-10"
          >
            <div className="w-full items-center flex justify-between">
              <div className="flex items-center">
                <span className="mr-4">
                  <Icon size={18} />
                </span>
                <p
                  className={cn(
                    "max-w-[150px] truncate",
                    isOpen
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-96 opacity-0"
                  )}
                >
                  {label}
                </p>
              </div>
              <div
                className={cn(
                  "whitespace-nowrap",
                  isOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-96 opacity-0"
                )}
              >
                <ChevronDown
                  size={18}
                  className="transition-transform duration-200"
                />
              </div>
            </div>
          </Button>
        </CollapsibleTrigger>
        {isChannel && <CreateChannelCard />}
      </div>

      {/* Collapsible Content */}
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="max-h-96 overflow-y-auto">
          {users?.length > 0 ? (
            users.map(({ chatId, latestMessage, user, name }) => (
              <div key={chatId}>
                {isChannel ? (
                  <ChannelChats
                    chatId={chatId as string}
                    name={name || ""}
                    latestMessage={latestMessage!}
                  />
                ) : (
                  <UserChats
                    chatId={chatId as string}
                    label={`${user?.firstName} ${user?.lastName}`}
                    user={user as UserProps}
                    latestMessage={latestMessage!}
                  />
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No chats available
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CollapseMenuButton;
