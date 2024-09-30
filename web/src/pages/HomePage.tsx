import { Route, Routes } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import useAuthMiddleware from "@/hooks/useAuthMiddleware";
import { ChatLayout } from "@/components/chat/ChatLayout";
import UserProfile from "./UserProfile";
import SheetSideBar from "@/components/SheetSideBar";

const HomePage = () => {
  useAuthMiddleware();
  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-background">
      <div className="max-md:hidden">
        <Sidebar />
      </div>
      <div className=" w-full">
        <Routes>
          <Route path="/profile" element={<UserProfile />} />
          <Route
            path="/direct-messages/:id"
            element={<ChatLayout type="direct" />}
          />
          <Route
            index
            path="/direct-messages"
            element={
              <div className="h-screen">
                <div className="md:hidden mt-[20px]">
                  <SheetSideBar />
                </div>
                <div className="h-full w-full flex items-center justify-center ">
                  No chat selected
                </div>
              </div>
            }
          />
          <Route
            path="/channels"
            element={
              <>
                <div className="md:hidden mt-[20px]">
                  <SheetSideBar />
                </div>
                <div className="h-full w-full flex items-center justify-center">
                  No chat selected
                </div>
              </>
            }
          />
          <Route path="/channels/:id" element={<ChatLayout type="course" />} />
        </Routes>
      </div>
    </div>
  );
};

export default HomePage;
