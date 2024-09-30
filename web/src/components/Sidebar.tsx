import { useAuth } from "@/contexts/AuthContext";
import uenrLogo from "../assets/uenrLogo.svg";
import { Menu } from "./Menu";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useNavigate } from "react-router-dom";
import { AvatarImage } from "@radix-ui/react-avatar";
import { getInitials } from "@/utils/helpers";

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="bg-muted/40 h-screen p-4 w-80 md:border-r flex flex-col justify-between overflow-y-auto">
      <div className="flex flex-col">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 mb-4">
            <img
              src={uenrLogo}
              alt="University Chat Forum"
              className="h-8 w-auto"
            />
            <h2 className="text-lg font-semibold">Chat Forum</h2>
          </div>
          <TooltipProvider disableHoverableContent>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Avatar
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer h-12 w-12"
                >
                  <AvatarImage
                    className="w-full object-cover"
                    src={user?.photoUrl}
                  />
                  <AvatarFallback>
                    {getInitials(
                      user?.firstName as string,
                      user?.lastName as string
                    )}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>Profile</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <nav className="overflow-y-auto max-h-[80vh] flex-grow">
          <Menu isOpen />
        </nav>
      </div>

      <div className="flex justify-center items-center p-4">
        <Button
          onClick={() => {
            logout();
          }}
          variant="outline"
          className="w-full justify-center h-10 mt-5"
        >
          <span className={"mr-4"}>
            <LogOut size={18} />
          </span>
          <p className={"whitespace-nowrap"}>Sign out</p>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
