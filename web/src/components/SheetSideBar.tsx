import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { LogOut, MenuIcon } from "lucide-react";
import uenrLogo from "../assets/uenrLogo.svg";
import { Menu } from "./Menu";
import { useAuth } from "@/contexts/AuthContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useNavigate } from "react-router-dom";
import { getInitials } from "@/utils/helpers";

const SheetSideBar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden ms-6 me-2" asChild>
        <Button className="h-8 " variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent
        className="sm:w-72 px-3 min-h-[100vh] flex flex-col justify-between overflow-y-auto"
        side="left"
      >
        <SheetHeader>
          <SheetTitle>
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
          </SheetTitle>
          <SheetDescription>
            {/* Sidebar menu for navigation and user actions. */}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-grow overflow-y-auto">
          <Menu isOpen />
        </div>
        <div className="flex justify-center items-center p-4">
          <div className="w-full grow flex items-end">
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
      </SheetContent>
    </Sheet>
  );
};

export default SheetSideBar;
