import CreatePostCard from "@/components/CreatePostCard";
import NewPost from "@/components/NewPostBox";
import SheetSideBar from "@/components/SheetSideBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useState } from "react";
import { FaRegThumbsUp } from "react-icons/fa";
import { FiMessageCircle, FiShare } from "react-icons/fi";

const Dashboard = () => {
  const [showCard, setShowCard] = useState(false);
  const [extra, setExtra] = useState<"Photo" | "Document" | "Audio" | null>(
    null
  );

  return (
    <div className="overflow-y-auto h-screen">
      <div className="md:hidden mt-[20px]">
        <SheetSideBar />
      </div>
      <div className="flex-1 p-4 bg-muted/10">
        <div className="mb-10 max-w-2xl mx-auto">
          {showCard && (
            <CreatePostCard
              setShowCard={setShowCard}
              extra={extra}
              setExtra={setExtra}
            />
          )}
          <NewPost setShowCard={setShowCard} setExtra={setExtra} />
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">News Feed</h1>
            <p className="text-muted-foreground">
              Stay up-to-date with the latest posts from your network.
            </p>
          </div>
          <div className="space-y-4">
            <Card className="bg-background shadow-md">
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">John Doe</div>
                    <div className="text-sm text-muted-foreground">
                      2 hours ago
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-4">
                <p>
                  Hey everyone! Just wanted to share an interesting article I
                  read about the latest advancements in AI. Let me know what you
                  think!
                </p>
              </CardContent>
              <CardFooter className="border-t flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <span className="w-5 h-5 flex justify-center items-center">
                      <FaRegThumbsUp />
                    </span>
                    <span className="sr-only">Like</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <span className="w-5 h-5 flex justify-center items-center">
                      <FiMessageCircle />
                    </span>
                    <span className="sr-only">Comment</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="">
                    <span className="w-5 h-5 flex justify-center items-center ">
                      <FiShare />
                    </span>
                    <span className="sr-only">Share</span>
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  12 likes • 4 comments
                </div>
              </CardFooter>
            </Card>
            <Card className="bg-background shadow-md">
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>SA</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">Sarah Anderson</div>
                    <div className="text-sm text-muted-foreground">
                      1 day ago
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-4">
                <p>
                  I'm excited to announce that I've just launched my new
                  website! Check it out and let me know what you think.
                </p>
              </CardContent>
              <CardFooter className="border-t flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    {/* <ThumbsUpIcon className="w-5 h-5" /> */}
                    <span className="sr-only">Like</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    {/* <MessageCircleIcon className="w-5 h-5" /> */}
                    <span className="sr-only">Comment</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    {/* <ShareIcon className="w-5 h-5" /> */}
                    <span className="sr-only">Share</span>
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  24 likes • 8 comments
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
