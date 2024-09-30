import { UserGroupChatWithId, UserProps } from "@/types";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { getInitials } from "@/utils/helpers";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Info,
  Mic,
  MicOff,
  Phone,
  PhoneCall,
  Video,
  VideoOff,
} from "lucide-react";
import { Button } from "../ui/button";
import { RecipientInfoCard } from "../RecipientInfoCard";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "../ui/skeleton";
import SheetSideBar from "../SheetSideBar";
import { useSocket } from "@/contexts/SocketContext";
import { useAgora } from "@/hooks/useAgora";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MdCallEnd } from "react-icons/md";
import { useToast } from "../ui/use-toast";
import { FaPhone } from "react-icons/fa";
import incomingCallSound from "@/assets/mixkit-marimba-ringtone-1359.wav";

const ChatHeader = lazy(() => import("../ChatHeader"));

export default function ChatTopBar({ type }: { type: "direct" | "course" }) {
  const { user } = useAuth();
  const {
    selectedUser,
    channel,
    chatId,
    callNotification,
    setCallNotification,
    users,
    setEndCallNotification,
    endCallNotification,
  } = useChat();
  const [showInfoCard, setShowInfoCard] = useState(false);
  const { onlineUsers, socket } = useSocket();
  const appid = import.meta.env.VITE_AGORA_APPID;

  const {
    initializeClient,
    leaveChannel,
    volumeIndicators,
    micMuted,
    videoMuted,
    toggleMic,
    initialRTM,
    rtmMembers,
    toggleVideo,
    initializeVideoClient,
    leaveVideoChannel,
    toggleVideoMic,
  } = useAgora(
    appid,
    callNotification ? callNotification.chatId : chatId,
    user?._id as string,
    user
  );
  const [inCall, setInCall] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const videoRemoteTrackRef = useRef<HTMLDivElement>(null);
  const videoLocalTrackRef = useRef<HTMLDivElement>(null);
  const [callType, setCallType] = useState<"Voice" | "Video" | null>(null);
  const { toast, dismiss } = useToast();

  useEffect(() => {}, [initialRTM]);

  const handleVideoCall = async () => {
    if (!inCall) {
      Promise.all([
        initializeVideoClient(videoRemoteTrackRef, videoLocalTrackRef),
        initialRTM(),
      ]);
      if (socket && !callNotification) {
        socket.emit(
          type === "direct" ? "start_call_direct" : "start_call_group",
          {
            chatId,
            callerId: user?._id,
            callType: "video",
            receiver: type == "direct" ? selectedUser?._id : null,
            courseId: type == "direct" ? null : channel?.courseId,
          }
        );
      }
      setCallType("Video");
      setInCall(true);
      setShowCall(true);
    } else {
      await leaveVideoChannel();
      setInCall(false);
      setShowCall(true);
    }
  };

  const caller = useMemo(
    () => users.find((user) => user._id === callNotification?.callerId),
    [callNotification, users]
  );
  const callerEnd = useMemo(
    () => users.find((user) => user._id === endCallNotification?.callerId),
    [endCallNotification, users]
  );

  const handleVoiceCall = async () => {
    if (!inCall) {
      Promise.all([initializeClient(), initialRTM()]);
      if (socket && !callNotification) {
        socket.emit(
          type === "direct" ? "start_call_direct" : "start_call_group",
          {
            chatId,
            callerId: user?._id,
            callType: "voice",
            receiver: type == "direct" ? selectedUser?._id : null,
            courseId: type == "direct" ? null : channel?.courseId,
          }
        );
      }
      setCallType("Voice");
      setInCall(true);
    } else {
      await leaveChannel();
      setInCall(false);
    }
  };

  const handleLeaveCall = useCallback((action: string) => {
    if (socket) {
      socket.emit(type === "direct" ? "end_call_direct" : "end_call_group", {
        chatId,
        callerId: user?._id,
        receiver: type == "direct" ? selectedUser?._id : null,
        courseId: type == "direct" ? null : channel?.courseId,
        action,
      });
    }
  }, []);

  const userIsSpeaking = useMemo(
    () => volumeIndicators[user?._id as unknown as number],
    [volumeIndicators, user]
  );

  useEffect(() => {
    return () => {
      if (inCall) {
        leaveChannel();
      }
    };
  }, [inCall]);

  useEffect(() => {
    if (endCallNotification) {
      if (rtmMembers.length <= 1) {
        setInCall(false);
        setShowCall(false);
      }
      toast({
        title: `Caller ${endCallNotification.action}`,
        description: `${callerEnd?.firstName} ${callerEnd?.lastName} has ended the call`,
        duration: 1000,
      });
    }
    return () => {
      setEndCallNotification(null);
    };
  }, [endCallNotification]);

  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    if (callNotification) {
      audio = new Audio(incomingCallSound);
      audio.play().catch((error) => {
        console.error("Error playing sound:", error);
      });
      toast({
        title: `Incoming ${callNotification.callType} call from ${caller?.firstName} ${caller?.lastName}`,
        description: `Click the button below to answer or reject the call`,
        duration: 30000,
        action: (
          <div className="flex space-x-2">
            <Button
              size={"icon"}
              onClick={() => {
                if (callNotification.callType === "voice") {
                  handleVoiceCall();
                } else {
                  handleVideoCall();
                }
                if (audio) {
                  audio.pause(); // Stop sound when answering the call
                  audio.currentTime = 0;
                }
                setCallNotification(null);
                dismiss();
              }}
            >
              <FaPhone size={20} />
            </Button>
            <Button
              onClick={() => {
                handleLeaveCall("cancelled");
                if (audio) {
                  audio.pause(); // Stop sound when answering the call
                  audio.currentTime = 0;
                }
                setCallNotification(null);
                dismiss();
              }}
              size={"icon"}
              className="bg-red-700"
            >
              <MdCallEnd size={20} />
            </Button>
          </div>
        ),
        onOpenChange: (open) => {
          if (!open && audio) {
            audio.pause(); // Stop sound when toast is closed
            audio.currentTime = 0;
          }
        },
      });
      setCallNotification(null);
    }
  }, [callNotification]);

  const sharedCourses = user?.courses?.filter((course) =>
    selectedUser?.courses.some((course2) => course._id === course2._id)
  );
  const isOnline = onlineUsers.some(
    (user: {userId: string}) => user.userId === selectedUser?._id
  );

  const toggleCard = () => {
    setShowInfoCard(!showInfoCard);
  };

  const initials = getInitials(
    selectedUser?.firstName as string,
    selectedUser?.lastName as string
  );
  return (
    <>
      <div className="border-b shadow-sm">
        <div className="flex flex-row justify-center items-center md:px-4 max-sm:pe-4">
          <div className="md:hidden">
            <SheetSideBar />
          </div>
          <div className="w-full overflow-hidden h-20 flex justify-between items-center ">
            <Suspense
              fallback={
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full bg-neutral-200" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px] bg-neutral-200" />
                    <Skeleton className="h-4 w-[150px] bg-neutral-200" />
                  </div>
                </div>
              }
            >
              <ChatHeader
                channel={channel as UserGroupChatWithId}
                initials={initials}
                isOnline={isOnline}
                selectedUser={selectedUser as UserProps}
                type={type}
              />
            </Suspense>
            <div className="w-full flex items-center justify-end">
              <Button onClick={handleVideoCall} variant={"ghost"} size={"icon"}>
                <Video size={20} className="text-muted-foreground" />
              </Button>
              <Button
                disabled={inCall}
                onClick={handleVoiceCall}
                variant={
                  inCall || callNotification?.chatId === chatId
                    ? "default"
                    : "ghost"
                }
                size={"icon"}
              >
                {inCall || callNotification?.chatId === chatId ? (
                  <PhoneCall size={20} />
                ) : (
                  <Phone size={20} className="text-muted-foreground" />
                )}
              </Button>
              <Button
                onClick={toggleCard}
                variant={"ghost"}
                size={"icon"}
                className={cn(
                  "h-9 w-9",
                  "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                )}
              >
                <Info size={20} className="text-muted-foreground" />
              </Button>
            </div>
          </div>
          <AnimatePresence>
            {showInfoCard && (
              <motion.div
                // ref={infoCardRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="fixed right-[20px] top-16 z-30"
              >
                <RecipientInfoCard
                  user={selectedUser as UserProps}
                  sharedCourses={
                    sharedCourses as { _id: string; name: string }[]
                  }
                  type={type}
                  channel={channel!}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {inCall && (
        <div
          onClick={() => setShowCall(true)}
          className=" px-4 cursor-pointer py-1 bg-gray-200 flex items-center justify-between"
        >
          {rtmMembers.length > 0 ? (
            <div>{rtmMembers.length} participant(s) in the call</div>
          ) : (
            <div>Ringing...</div>
          )}
          <Button variant="ghost" size={"icon"}>
            <Mic size={20} className="text-muted-foreground" />
          </Button>
        </div>
      )}
      {inCall && showCall && (
        <div className="fixed top-0 z-50 left-0 flex flex-col p-4 gap-5 justify-between bg-black h-full w-full">
          <div className="">
            <Button
              variant={"ghost"}
              size={"icon"}
              onClick={() => setShowCall(false)}
            >
              <ArrowLeft size={35} className="text-muted-foreground" />
            </Button>
          </div>
          <div className="flex flex-col items-center h-[80vh] justify-center">
            <div className="overflow-y-auto grid-container justify-center h-full items-center w-full">
              {callType === "Voice" ? (
                <>
                  {rtmMembers.map((user) => {
                    const isSpeaking =
                      volumeIndicators[user.userRtcUid as unknown as number];
                    return (
                      <Card
                        key={user._id}
                        className={cn(
                          "w-full h-full bg-neutral-950 border-neutral-800"
                        )}
                      >
                        <CardHeader>
                          <CardTitle className="text-white text-base flex justify-between">
                            {user?.firstName} {user?.lastName}
                            <Mic className="text-muted-foreground" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center h-full">
                          <Avatar
                            className={cn(
                              " h-52 w-52",
                              isSpeaking && "border-4 border-green-500"
                            )}
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
                        </CardContent>
                      </Card>
                    );
                  })}
                </>
              ) : (
                <>
                  {rtmMembers.map((user) => {
                    return (
                      <Card
                        key={user._id}
                        className={cn(
                          "w-full overflow-hidden pb-20 h-full bg-neutral-950 border-neutral-800"
                        )}
                      >
                        <CardHeader>
                          <CardTitle className="text-white text-base flex justify-between">
                            {user?.firstName} {user?.lastName}
                            <Mic className="text-muted-foreground" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent
                          className={`flex items-center justify-center w-full h-full p-0 `}
                        >
                          <div
                            ref={videoRemoteTrackRef}
                            className="aspect-video w-full "
                          ></div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </>
              )}
            </div>
            {callType === "Video" && (
              <div className="bg-neutral-900 mt-1 overflow-hidden relative rounded-md h-[10rem] flex justify-center border items-center">
                <div className="h-full ">
                  <div ref={videoLocalTrackRef} className="aspect-video h-full">
                    {videoMuted && (
                      <div className="aspect-video absolute top-0 bg-neutral-900 h-full flex justify-center items-center ">
                        <Avatar
                          className={cn(
                            " h-20 w-20",
                            userIsSpeaking && "border-4 border-green-500"
                          )}
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
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className=" text-white flex  space-x-3 justify-center">
            {callType === "Video" && (
              <div
                onClick={toggleVideo}
                className={cn(
                  " cursor-pointer  w-14 flex justify-center items-center h-14 rounded-full",
                  videoMuted ? "bg-white text-red-700" : ""
                )}
              >
                <VideoOff size={30} />
              </div>
            )}
            <div
              onClick={callType === "Video" ? toggleVideoMic : toggleMic}
              className={cn(
                " cursor-pointer  w-14 flex justify-center items-center h-14 rounded-full",
                micMuted ? "bg-white text-red-700" : ""
              )}
            >
              <MicOff size={30} />
            </div>
            <div
              onClick={() => {
                setShowCall(false);
                handleVoiceCall();
                handleVideoCall();
                handleLeaveCall("left");
              }}
              className="bg-red-700 w-14 cursor-pointer flex justify-center items-center h-14 rounded-full "
            >
              <MdCallEnd size={30} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
