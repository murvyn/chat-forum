import { FileImage, Mic, SendHorizontal, Trash2, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { EmojiPicker } from "../EmojiPicker";

import { useChat } from "@/contexts/ChatContext";
import { Label } from "../ui/label";
import { usePost } from "@/contexts/PostContext";
import { LiveAudioVisualizer } from "react-audio-visualize";
import { AnimatePresence, motion } from "framer-motion";
import AudioPlayer from "../AudioPlayer";

const ChatBottomBar = () => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendTextMessage, chatId, upload } = useChat();
  const [files, setFiles] = useState<File[] | null>(null);
  const {
    isRecording,
    startRecording,
    stopRecording,
    audioUrl,
    setAudioUrl,
    recordingTime,
    mediaRecord,
  } = usePost();

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        const selectedFiles = Array.from(event.target.files);
        const filteredFiles = selectedFiles?.filter(
          (file) => file.size <= 20 * 1024 * 1024
        );
        if (filteredFiles.length < selectedFiles.length) {
          alert("Some files were too large and were not added");
          return;
        }
        setFiles(filteredFiles);
      }
    },
    []
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const handleSend = async () => {
    try {
      const id = Date.now().toString();
      if (message.trim()) {
        sendTextMessage(message.trim(), "text", chatId, id);
        setMessage("");

        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      } else if (files) {
        const uploadPromises = files.map((file) => upload(file));
        const uploadedFiles = await Promise.all(uploadPromises);
        uploadedFiles.forEach((uploadedFile) => {
          if (uploadedFile) {
            sendTextMessage(
              uploadedFile.uploadResult.secure_url,
              uploadedFile.type,
              chatId,
              id
            );
          }
        });
      } else if (audioUrl) {
        sendTextMessage(audioUrl, "audio", chatId, id);
      }
    } finally {
      setFiles(null);
      setAudioUrl("");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }

    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      setMessage((prev) => prev + "\n");
    }
  };

  const autoResizeTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  useEffect(() => {
    const timeoutId = setTimeout(autoResizeTextarea, 100);
    return () => clearTimeout(timeoutId);
  }, [message, autoResizeTextarea]);

  return (
    <div className="p-2 flex justify-between w-full items-center gap-2">
      <div className="w-full relative ">
        {files && (
          <div className="w-[26rem] p-4  absolute bottom-10 rounded-lg z-50 bg-neutral-100 right-0  max-h-[20rem] h-[20rem] shadow-2xl flex gap-1 overflow-auto flex-wrap items-center justify-center">
            <Button
              onClick={() => setFiles(null)}
              variant={"ghost"}
              size={"icon"}
              className="absolute top-0 right-0 m-2 "
            >
              <X />
            </Button>
            {files.map((file, index) => (
              <React.Fragment key={index}>
                {file.type.includes("image") ? (
                  <img
                    className={`object-cover shadow-lg ${
                      files.length === 1 ? "w-1/2" : "w-[49%] h-1/2"
                    } `}
                    src={URL.createObjectURL(file)}
                    alt=""
                  />
                ) : (
                  <video
                    className={`object-cover shadow-lg ${
                      files.length === 1 ? "w-1/2" : "w-[49%] h-1/2"
                    } `}
                    controls
                    src={URL.createObjectURL(file)}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        {audioUrl ? (
          <div className="w-full flex items-center">
            <AudioPlayer url={audioUrl} />
            <Button
              onClick={() => setAudioUrl(null)}
              size={"icon"}
              variant={"ghost"}
              className=""
            >
              <Trash2 size={20} color="#83838B" />
            </Button>
          </div>
        ) : (
          <>
            {isRecording ? (
              <div className=" flex items-center gap-2 w-full">
                <div className="blinking-red-light"></div>
                <p>{formatTime(recordingTime)}</p>
                {mediaRecord && (
                  <LiveAudioVisualizer
                    mediaRecorder={mediaRecord && mediaRecord}
                    width={250}
                    height={30}
                    barColor="#83838B"
                  />
                )}
              </div>
            ) : (
              <>
                <AnimatePresence initial={false}>
                  <motion.div
                    key="input"
                    className="w-full relative"
                    layout
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1 }}
                    transition={{
                      opacity: { duration: 0.05 },
                      layout: {
                        type: "spring",
                        bounce: 0.15,
                      },
                    }}
                  >
                    <textarea
                      disabled={files !== null}
                      autoComplete="off"
                      value={message}
                      ref={textareaRef}
                      onKeyDown={handleKeyPress}
                      onChange={handleInputChange}
                      name="message"
                      placeholder="Message"
                      className={cn(
                        "w-full border flex items-center resize-none overflow-y-auto bg-background p-2 max-h-[10rem]  ",
                        "rounded-t-lg outline-none text-sm"
                      )}
                      rows={1}
                    />
                    <div className="absolute right-2 bottom-0.5  ">
                      <EmojiPicker
                        onChange={(value) => {
                          setMessage(message + value);
                          if (textareaRef.current) {
                            textareaRef.current.focus();
                          }
                        }}
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </>
            )}
          </>
        )}
      </div>

      <div className="flex items-end h-full">
        {message.trim() || audioUrl || files ? (
          <Button
            variant={"ghost"}
            size={"icon"}
            className={cn(
              "h-9 w-9",
              "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0"
            )}
            onClick={handleSend}
          >
            <SendHorizontal size={20} className="text-muted-foreground" />
          </Button>
        ) : (
          <div className="flex">
            <Label
              htmlFor="file"
              className="flex h-9 w-9 items-center justify-center flex-col cursor-pointer"
            >
              <input
                title="file"
                type="file"
                accept="image/*, video/*"
                multiple
                className="hidden"
                id="file"
                onChange={handleFileChange}
              />
              <FileImage size={20} className="text-muted-foreground" />
            </Label>
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={"ghost"}
              size={"icon"}
              className={cn(
                "h-9 w-9",
                "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
              )}
            >
              {isRecording ? (
                <X size={20} className="text-muted-foreground" />
              ) : (
                <Mic size={20} className="text-muted-foreground" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBottomBar;
