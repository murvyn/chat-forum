import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from "react";

interface PostContextProps {
  audioUrl: string | null;
  setAudioUrl: Dispatch<SetStateAction<string | null>>;
  blob: Blob | null;
  mediaRecord: MediaRecorder | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  isRecording: boolean;
  recordingTime: number;
}

export const usePost = () => {
  return useContext(PostContext);
};

export const PostContext = createContext<PostContextProps>({
  audioUrl: "",
  setAudioUrl: () => {},
  blob: new Blob(),
  startRecording: () => Promise.resolve(),
  stopRecording: () => {},
  isRecording: false,
  recordingTime: 0,
  mediaRecord: null,
});

export const PostProvider = ({ children }: { children: ReactNode }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [mediaRecord, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const timerIntervalRef = useRef<number | null>(null);

  const startRecording = async () => {
    setIsRecording(true);
    setRecordingTime(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/mp4" });
      setMediaRecorder(mediaRecorder);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/mp4",
        });
        setBlob(audioBlob);
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setAudioUrl(reader.result as string);
        };
        audioChunksRef.current = [];
      };

      mediaRecorder.start();

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing the microphone:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setMediaRecorder(null);
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const value: PostContextProps = {
    stopRecording,
    startRecording,
    audioUrl,
    isRecording,
    setAudioUrl,
    recordingTime,
    blob,
    mediaRecord,
  };
  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
};
