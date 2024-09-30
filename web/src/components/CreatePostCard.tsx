import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

import { FaFileAlt, FaPhotoVideo, FaTimes } from "react-icons/fa";
import { AiFillAudio } from "react-icons/ai";
import { Textarea } from "./ui/textarea";
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { PostContext } from "@/contexts/PostContext";
import { RiDeleteBin6Line } from "react-icons/ri";
import Word from "../assets/word.svg";
import powerpoint from "../assets/powerpoint.svg";
import pdf from "../assets/pdf.svg";
import ExtraContent from "./ExtraContent";
import Tags from "./Tags";

interface Props {
  extra: "Photo" | "Document" | "Audio" | null;
  setExtra: Dispatch<SetStateAction<"Photo" | "Document" | "Audio" | null>>;
  setShowCard: Dispatch<SetStateAction<boolean>>;
}

const CreatePostCard = ({ extra, setExtra, setShowCard }: Props) => {
  const { audioUrl, setAudioUrl } = useContext(PostContext);
  const [files, setFiles] = useState<File[] | null>(null);
  const [text, setText] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setShowCard(false);
      }
    };
    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        const selectedFiles = Array.from(event.target.files);
        const filteredFiles = selectedFiles.filter(
          (file) => file.size <= 20 * 1024 * 1024
        );
        if (filteredFiles < selectedFiles) {
          alert("Some files were too large and were not added");
        }
        setFiles((prevFiles) => [...(prevFiles ?? []), ...filteredFiles]);
      }
    },
    []
  );

  const renderFilePreview = useCallback((file: File) => {
    if (file.type.startsWith("image/")) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt="preview"
          className="w-10 h-auto"
        />
      );
    } else if (file.type.startsWith("video/")) {
      return (
        <video
          src={URL.createObjectURL(file)}
          controls
          className="w-full h-auto"
        />
      );
    } else if (file.type === "application/pdf") {
      return <img src={pdf} className="w-10" alt="pdf" />;
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return <img src={Word} alt="word" />;
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      return <img src={powerpoint} alt="powerpoint" />;
    } else {
      return <FaFileAlt size={50} />;
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles(
      (prevFiles) => prevFiles && prevFiles.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="fixed top-0 left-0 flex justify-center items-center w-full h-full bg-black  bg-opacity-60 z-30">
      <Card ref={cardRef} className="z-50 w-[30rem]">
        <CardHeader>
          <CardTitle className="text-md mx-auto">Create post</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Avatar className="w-16 h-16">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col font-medium">
              <span>Marvin Asamoah</span>
              <Tags />
            </div>
          </div>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="mt-2">
                <Textarea
                  rows={5}
                  id="name"
                  placeholder="What is on your mind?"
                  className="outline-none border-none resize-none placeholder:text-xl"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                {files && (
                  <div className="w-full mt-4 flex flex-wrap">
                    {files?.map((file, index) => {
                      return (
                        <div key={index} className="relative w-auto p-2">
                          <Button
                            onClick={() => removeFile(index)}
                            type="button"
                            variant={"outline"}
                            size={"icon"}
                            className="rounded-full absolute top-0 right-0 p-0 text-neutral-400 h-7 w-7"
                          >
                            <FaTimes />
                          </Button>
                          {renderFilePreview(file)}
                        </div>
                      );
                    })}
                  </div>
                )}
                {audioUrl && (
                  <div className="w-full flex items-center space-x-3">
                    <audio controls className="w-full" src={audioUrl} />
                    <Button
                      onClick={() => setAudioUrl(null)}
                      size={"icon"}
                      className=""
                    >
                      <RiDeleteBin6Line />
                    </Button>
                  </div>
                )}
              </div>
              <ExtraContent
                extra={extra}
                files={files}
                handleFileChange={handleFileChange}
                setExtra={setExtra}
              />

              <Card className="shadow-sm">
                <div className="flex flex-row justify-between   items-center mx-4 my-2">
                  <p className="font-semibold">Add to your post</p>
                  <div className="flex flex-row">
                    <Button
                      onClick={() => setExtra("Photo")}
                      type="button"
                      className={`rounded-full  text-xl ${
                        extra === "Photo"
                          ? "bg-neutral-200  text-black"
                          : "text-green-600"
                      }  `}
                      variant={"ghost"}
                      size={"icon"}
                    >
                      <FaPhotoVideo />
                    </Button>

                    <Button
                      onClick={() => setExtra("Document")}
                      type="button"
                      className={`rounded-full  text-xl ${
                        extra === "Document"
                          ? "bg-neutral-200  text-black"
                          : "text-green-600"
                      } p-0 m-0`}
                      variant={"ghost"}
                      size={"icon"}
                    >
                      <FaFileAlt />
                    </Button>

                    <Button
                      onClick={() => setExtra("Audio")}
                      type="button"
                      className={`rounded-full  text-xl ${
                        extra === "Audio"
                          ? "bg-neutral-200  text-black"
                          : "text-green-600"
                      }`}
                      variant={"ghost"}
                      size={"icon"}
                    >
                      <AiFillAudio />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
            <div className="flex mt-4 justify-center">
              <Button type="submit" className="w-full">
                Post
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePostCard;
