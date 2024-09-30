import React, { Dispatch, SetStateAction, useMemo } from "react";
import { Card } from "./ui/card";
import { FaFileAlt, FaPhotoVideo, FaPlus, FaTimes } from "react-icons/fa";
import { Button } from "./ui/button";
import AudioRecorder from "./AudioRecorder";

interface Props {
  extra: "Photo" | "Document" | "Audio" | null;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  files: File[] | null;
  setExtra: Dispatch<SetStateAction<"Photo" | "Document" | "Audio" | null>>;
}

const ExtraContent = ({ extra, handleFileChange, files, setExtra }: Props) => {
  return useMemo(() => {
    switch (extra) {
      case "Photo":
        return (
          <Card className="p-3">
            <>
              <input
                type="file"
                accept="image/*, video/*"
                multiple
                className="hidden"
                id="file"
                onChange={handleFileChange}
              />
              <label
                htmlFor="file"
                className="flex items-center justify-center flex-col w-full cursor-pointer"
              >
                {files ? (
                  <span>
                    <FaPlus />
                  </span>
                ) : (
                  <div
                    className={`w-full ${
                      files ? "" : "h-[10rem]"
                    } hover:bg-neutral-200 bg-neutral-100 flex items-center justify-center relative`}
                  >
                    <div className="flex items-center justify-center flex-col ">
                      <Button
                        onClick={() => setExtra(null)}
                        type="button"
                        variant={"outline"}
                        size={"icon"}
                        className="rounded-full absolute top-0 right-0 p-0 text-neutral-400 h-7 w-7"
                      >
                        <FaTimes />
                      </Button>
                      <Button
                        type="button"
                        variant={"ghost"}
                        className="rounded-full text-2xl p-0 h-10 w-10"
                      >
                        <FaPhotoVideo />
                      </Button>
                      <p>Add photos/videos</p>
                    </div>
                  </div>
                )}
              </label>
            </>
          </Card>
        );

      case "Document":
        return (
          <Card className="p-3">
            <input
              type="file"
              accept=".pdf, .doc, .docx, .ppt, .pptx, .xls, .xlsx, .txt"
              multiple
              className="hidden"
              id="document"
              onChange={handleFileChange}
            />
            <label
              htmlFor="document"
              className="flex items-center justify-center flex-col w-full cursor-pointer"
            >
              {files ? (
                <span>
                  <FaPlus />
                </span>
              ) : (
                <div
                  className={`w-full ${
                    files ? "" : "h-[10rem]"
                  } hover:bg-neutral-200 bg-neutral-100 flex items-center justify-center relative`}
                >
                  <div className="flex items-center justify-center flex-col ">
                    <Button
                      onClick={() => setExtra(null)}
                      type="button"
                      variant={"outline"}
                      size={"icon"}
                      className="rounded-full absolute top-0 right-0 p-0 text-neutral-400 h-7 w-7"
                    >
                      <FaTimes />
                    </Button>
                    <Button
                      type="button"
                      variant={"ghost"}
                      className="rounded-full text-2xl p-0 h-10 w-10"
                    >
                      <FaFileAlt />
                    </Button>
                    <p>Add document</p>
                  </div>
                </div>
              )}
            </label>
          </Card>
        );

      case "Audio":
        return (
          <Card className="p-3">
            <div className="w-full  flex items-center justify-center relative">
              <div className="flex items-center justify-center flex-col ">
                <Button
                  type="button"
                  onClick={() => setExtra(null)}
                  variant={"outline"}
                  size={"icon"}
                  className="rounded-full absolute top-0 right-0 p-0 text-neutral-400 h-7 w-7"
                >
                  <FaTimes />
                </Button>
              </div>
              <AudioRecorder />
            </div>
          </Card>
        );
      default:
        return null;
    }
  }, [extra, files, handleFileChange]);
};

export default ExtraContent;
