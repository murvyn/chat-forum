// src/hooks/useAgora.ts
import { RefObject, useState } from "react";
import AgoraRTC, {
  IAgoraRTCRemoteUser,
  ILocalAudioTrack,
  ILocalVideoTrack,
} from "agora-rtc-sdk-ng";
import AgoraRTM, { RtmChannel } from "agora-rtm-sdk";
import { useQuery } from "@tanstack/react-query";
import { UserProps } from "@/types";
import { baseUrl } from "@/utils/services";
import { useToast } from "@/components/ui/use-toast";

export const useAgora = (
  appId: string,
  channel: string,
  uid: string,
  user: UserProps | null
) => {
  const {toast} = useToast()
  const [client] = useState(() =>
    AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
  );
  const [rtmClient] = useState(() => AgoraRTM.createInstance(appId));
  const [channelInstance, setChannelInstance] = useState<RtmChannel | null>(
    null
  );
  const [localAudioTrack, setLocalAudioTrack] =
    useState<ILocalAudioTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<ILocalVideoTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [volumeIndicators, setVolumeIndicators] = useState<
    Record<number, number>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [micMuted, setMicMuted] = useState(true);
  const [videoMuted, setVideoMuted] = useState(false);
  const [rtmMembers, setRtmMembers] = useState<
    {
      _id: string;
      firstName: string;
      lastName: string;
      photoUrl: string;
      userRtcUid: string;
    }[]
  >([]);

  const { data: rtmToken, isLoading: isLoadingRTMToken } = useQuery({
    queryKey: ["rtmToken", { appId: appId, uid: uid }],
    queryFn: async () => {
      const response = await fetch(`${baseUrl}/generate-rtm-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid }),
      });

      if (!response.ok) {
        toast({
          title: "Something went wrong",
          description: "Failed to fetch RTM token",
          duration: 2000,
          variant: "destructive",
        });
        throw new Error("Failed to fetch RTM token");
      }

      const data = await response.json();
      return data.token;
    },
    enabled: !!uid,
  });

  const { data: rtcToken, isLoading: isLoadingRTCToken } = useQuery({
    queryKey: [
      "rtcToken",
      {
        channelName: channel,
        uid: parseInt(uid),
        role: "publisher",
      },
    ],
    queryFn: async () => {
      const response = await fetch(`${baseUrl}/generate-rtc-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appId, channelName: channel, uid }),
      });

      if (!response.ok) {
        toast({
          title: "Something went wrong",
          description: "Failed to fetch token",
          duration: 2000,
          variant: "destructive",
        });
        throw new Error("Failed to fetch token");
      }

      const data = await response.json();
      return data.tokenWithUid;
    },
    enabled: !!appId && !!channel && !!uid,
  });

  const initialRTM = async () => {
    if (isLoadingRTMToken) {
      return;
    }

    try {
      await rtmClient.login({ uid, token: rtmToken });

      await rtmClient.addOrUpdateLocalUserAttributes({
        firstName: String(user?.firstName),
        lastName: String(user?.lastName),
        photoUrl: String(user?.photoUrl),
        userRtcUid: String(uid),
      });

      const channelInstance = rtmClient.createChannel(channel);
      await channelInstance.join();
      setChannelInstance(channelInstance);

      const allMembers = await channelInstance.getMembers();
      console.log("allMembers", allMembers);

      for (const member of allMembers) {
        if (member !== uid) {
          try {
            const { firstName, lastName, photoUrl, userRtcUid } =
              await rtmClient.getUserAttributesByKeys(member, [
                "firstName",
                "lastName",
                "photoUrl",
                "userRtcUid",
              ]);

            setRtmMembers((prev) => {
              if (!prev.some((m) => m._id === member)) {
                return [
                  ...prev,
                  { _id: member, firstName, lastName, photoUrl, userRtcUid },
                ];
              }
              return prev;
            });
          } catch (error) {
            if (error) {
              console.warn(`User ${member} is not online. Skipping...`);
            } else {
              console.error("Failed to get user attributes:", error);
            }
          }
        }
      }

      channelInstance.on("MemberJoined", async (memberId) => {
        if (memberId !== uid) {
          const { firstName, lastName, photoUrl, userRtcUid } =
            await rtmClient.getUserAttributesByKeys(memberId, [
              "firstName",
              "lastName",
              "photoUrl",
              "userRtcUid",
            ]);
          setRtmMembers((prev) => {
            if (!prev.some((member) => member._id === memberId)) {
              return [
                ...prev,
                { _id: memberId, firstName, lastName, photoUrl, userRtcUid },
              ];
            }
            return prev;
          });
        }
      });

      channelInstance.on("MemberLeft", (memberId) => {
        console.log(`User ${memberId} left the channel`);
        setRtmMembers((prev) => prev.filter((id) => id._id !== memberId));
      });

      window.addEventListener("beforeunload", leaveRTMChannel);
    } catch (error) {
      console.error("Failed to log in to RTM", error);
    }
  };

  const initializeClient = async () => {
    if (isLoadingRTCToken) {
      return;
    }
    try {
      client.on("user-joined", async (user) => {
        console.log(user);
        setRemoteUsers((prev) => [...prev, user]);
      });
      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "audio") {
          const { audioTrack } = user;
          if (audioTrack) {
            audioTrack.play();
          }
        }
      });

      client.on("user-left", async (user) => {
        console.log("User left: ", user);
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        if (remoteUsers.length < 0) {
          if (localAudioTrack) {
            localAudioTrack.stop();
            localAudioTrack.close();
          }

          await client.unpublish();
          await client.leave();

          setRemoteUsers([]);
          setLocalAudioTrack(null);
        }
      });

      await client.join(appId, channel, rtcToken, uid);
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      setLocalAudioTrack(audioTrack);
      await audioTrack.setMuted(micMuted);
      await client.publish(audioTrack);

      // AgoraRTC.setParameter("AUDIO_VOLUME_INDICATOR_INTERVAL", 200);
      client.enableAudioVolumeIndicator();

      client.on("volume-indicator", (volumes) => {
        const newVolumes = { ...volumeIndicators };
        volumes.forEach((volumeObj) => {
          if (volumeObj.level >= 50) {
            newVolumes[volumeObj.uid as number] = volumeObj.level;
          } else {
            delete newVolumes[volumeObj.uid as number];
          }
        });
        setVolumeIndicators(newVolumes);
      });

      client.on("exception", (err) => {
        console.error("Agora error:", err);
        setError(`Agora error: ${err.msg}`);
      });
    } catch (err) {
      console.error("Failed to initialize client:", err);
      setError(`Initialization error: ${err}`);
    }
  };

  const initializeVideoClient = async (
    videoRemote: RefObject<HTMLDivElement>,
    videoLocal: RefObject<HTMLDivElement>
  ) => {
    if (isLoadingRTCToken) {
      return;
    }
    try {
      client.on("user-joined", async (user) => {
        console.log(user);
        setRemoteUsers((prev) => [...prev, user]);
      });

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video" && user.videoTrack) {
          const { videoTrack } = user;
          if (videoTrack && videoRemote.current) {
            videoTrack.play(videoRemote.current);
          }
        }
      });

      client.on("user-left", async (user) => {
        console.log("User left: ", user);
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      await client.join(appId, channel, rtcToken, uid);

      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);

      await audioTrack.setMuted(micMuted);
      await videoTrack.setEnabled(true);
      await videoTrack.setMuted(videoMuted);

      await client.publish([audioTrack, videoTrack]);
      if (videoLocal.current) {
        videoTrack.play(videoLocal.current);
      }

      // AgoraRTC.setParameter("AUDIO_VOLUME_INDICATOR_INTERVAL", 200);
      client.enableAudioVolumeIndicator();

      client.on("volume-indicator", (volumes) => {
        const newVolumes = { ...volumeIndicators };
        volumes.forEach((volumeObj) => {
          if (volumeObj.level >= 50) {
            newVolumes[volumeObj.uid as number] = volumeObj.level;
          } else {
            delete newVolumes[volumeObj.uid as number];
          }
        });
        setVolumeIndicators(newVolumes);
      });

      client.on("user-unpublished", user => {
        console.log(`User ${user.uid} unpublished`, user);
        if (user.videoTrack) {
          user.videoTrack.stop();
          user.audioTrack?.stop();
        }

      })

      client.on("exception", (err) => {
        console.error("Agora error:", err);
        setError(`Agora error: ${err.msg}`);
      });
    } catch (error) {
      console.error("Failed to initialize client:", error);
      setError(`Initialization error: ${error}`);
    }
  };

  const leaveRTMChannel = async () => {
    if (channelInstance) {
      channelInstance.removeAllListeners(); // Remove all event listeners
      await channelInstance.leave();
    }
    await rtmClient.logout();
    setChannelInstance(null);
  };

  const leaveChannel = async () => {
    try {
      if (client.connectionState !== "CONNECTED") {
        console.warn("Client is not connected to the channel. Cannot leave.");
        return;
      }
      if (localAudioTrack) {
        localAudioTrack?.stop();
        localAudioTrack?.close();
        setLocalAudioTrack(null);
      }

      if (client.localTracks.length > 0) {
        await client.unpublish();
      }

      await client.leave();
      await leaveRTMChannel();
      setRemoteUsers([]);

      console.log("Successfully left the channel.");
    } catch (err) {
      console.error("Failed to leave channel:", err);
      setError(`Leave channel error: ${err}`);
    } finally {
      setRtmMembers([]); 
      setChannelInstance(null);
      setLocalAudioTrack(null); 
      setLocalVideoTrack(null);
      setRemoteUsers([]); 
      setMicMuted(true);
      setVideoMuted(false);
    }
  };
  const leaveVideoChannel = async () => {
    try {
      if (client.connectionState !== "CONNECTED") {
        console.warn("Client is not connected to the channel. Cannot leave.");
        return;
      }

      if (localAudioTrack && localVideoTrack) {
        await client.unpublish([localAudioTrack, localVideoTrack]);
      }
      // if (localAudioTrack) {
      localAudioTrack?.stop();
      localAudioTrack?.close();
      setLocalAudioTrack(null);
      // }

      // if (localVideoTrack) {
      localVideoTrack?.stop();
      localVideoTrack?.close();
      setLocalVideoTrack(null);
      // }

      await client.leave();
      await leaveRTMChannel();
      setRemoteUsers([]);

      console.log("Successfully left the channel.");
    } catch (err) {
      console.error("Failed to leave channel:", err);
      setError(`Leave channel error: ${err}`);
    } finally {
      setRtmMembers([]); 
      setChannelInstance(null);
      setLocalAudioTrack(null); 
      setLocalVideoTrack(null);
      setRemoteUsers([]); 
      setMicMuted(true);
      setVideoMuted(false);
    }
  };

  const toggleMic = async () => {
    if (!localAudioTrack) {
      return;
    }
    try {
      if (localAudioTrack.muted) {
        await localAudioTrack.setMuted(false);
        setMicMuted(false);
      } else {
        await localAudioTrack.setMuted(true);
        setMicMuted(true);
      }
    } catch (err) {
      console.error("Failed to toggle mic state:", err);
      setError(`Toggle mic error: ${err}`);
    }
  };

  const toggleVideo = async () => {
    if (!localVideoTrack) {
      return;
    }
    try {
      if (localVideoTrack.muted) {
        await localVideoTrack.setMuted(false);
        setVideoMuted(false);
      } else {
        await localVideoTrack.setMuted(true);
        setVideoMuted(true);
      }
    } catch (err) {
      console.error("Failed to toggle video state:", err);
      setError(`Toggle video error: ${err}`);
    }
  };
  const toggleVideoMic = async () => {
    console.log("mic", localAudioTrack);
    if (!localAudioTrack) {
      return;
    }
    try {
      if (micMuted) {
        await localAudioTrack.setMuted(false);
        setMicMuted(false);
      } else {
        await localAudioTrack.setMuted(true);
        setMicMuted(true);
      }
    } catch (err) {
      console.error("Failed to toggle audio state:", err);
      setError(`Toggle audio error: ${err}`);
    }
  };

  return {
    initializeClient,
    initializeVideoClient,
    leaveChannel,
    remoteUsers,
    volumeIndicators,
    error,
    micMuted,
    videoMuted,
    toggleMic,
    toggleVideo,
    initialRTM,
    rtmMembers,
    rtcToken,
    leaveVideoChannel,
    toggleVideoMic,
  };
};
