import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FaFileAlt, FaPhotoVideo } from "react-icons/fa";
import { AiFillAudio } from "react-icons/ai";
import { Dispatch, SetStateAction } from "react";

const NewPost = ({
  setShowCard,
  setExtra,
}: {
  setShowCard: Dispatch<SetStateAction<boolean>>;
  setExtra: Dispatch<SetStateAction<"Photo" | "Document" | "Audio" | null>>;
}) => {
  return (
    <Card className=" w-full p-[20px] shadow-lg">
      <div className="flex space-x-2">
        <span className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </span>

        <span
          onClick={() => setShowCard(true)}
          className="w-full border-none focus:ring-0 hover:cursor-pointer bg-gray-100 flex items-center rounded-full"
        >
          <span className="ms-4 text-sm text-gray-700">
            What's on your mind?
          </span>
        </span>
      </div>
      <hr className="my-2" />
      <div className="w-full flex justify-center gap-6">
        <Button
          onClick={() => {
            setShowCard(true);
            setExtra("Photo");
          }}
          variant="ghost"
          className="flex gap-2"
        >
          <span className="text-green-600 text-xl">
            <FaPhotoVideo />
          </span>
          <span className="max-sm:hidden">Photo/video</span>
        </Button>
        <Button
          onClick={() => {
            setShowCard(true);
            setExtra("Audio");
          }}
          variant="ghost"
          className="flex gap-2"
        >
          <span className="text-green-600 text-xl">
            <AiFillAudio />
          </span>
          <span className="max-sm:hidden">Audio</span>
        </Button>
        <Button
          onClick={() => {
            setShowCard(true);
            setExtra("Document");
          }}
          variant="ghost"
          className="flex gap-2"
        >
          <span className="text-green-600 text-xl">
            <FaFileAlt />
          </span>
          <span className="max-sm:hidden">Document</span>
        </Button>
      </div>
    </Card>
  );
};

export default NewPost;
