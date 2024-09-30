import { Pause } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaPlay } from "react-icons/fa";
// import WavesurferPlayer from "@wavesurfer/react";
import { useWavesurfer } from "@wavesurfer/react";
// import WaveSurfer from "wavesurfer.js";

const AudioPlayer = ({ url }: { url: string }) => {
  const waveformRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const formatTime = (seconds: number) =>
    [seconds / 60, seconds % 60]
      .map((v) => `0${Math.floor(v)}`.slice(-2))
      .join(":");

  const { wavesurfer, isPlaying } = useWavesurfer({
    container: waveformRef,
    waveColor: "#A8DBA8",
    progressColor: "rgb(71, 71, 71)",
    url: url,
    height: 30,
    barWidth: 2,
    barHeight: 2,
    cursorWidth: 0,
  });

  useEffect(() => {
    if (wavesurfer) {
      wavesurfer.on("ready", () => {
        setDuration(wavesurfer.getDuration());
      });

      wavesurfer.on("audioprocess", () => {
        setCurrentTime(wavesurfer.getCurrentTime());
      });
    }
  }, [wavesurfer]);

  const handlePlayPause = useCallback(() => {
    wavesurfer && wavesurfer.playPause();
  }, [wavesurfer]);

  return (
    <div className="flex items-center space-x-2 w-[15rem]">
      <div className="" onClick={handlePlayPause}>
        {isPlaying ? <Pause /> : <FaPlay />}
      </div>
      <div ref={waveformRef} className="w-full"></div>
      <p className="text-xs whitespace-nowrap">
        {formatTime(currentTime)} / {formatTime(duration)}
      </p>
    </div>
  );
};

export default AudioPlayer;
