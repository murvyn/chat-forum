import { useMemo } from "react";
import AudioPlayer from "./AudioPlayer";

const MessageComponent = ({
  type,
  text,
}: {
  type: "text" | "document" | "audio" | "video" | "image";
  text: string;
}) => {
  return useMemo(() => {
    switch (type) {
      case "text":
        return <span>{text}</span>;
      case "document":
        return (
          <a href={text} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        );
      case "audio":
        return <AudioPlayer url={text} />;
      case "video":
        return (
          <video
            className="max-h-96 rounded-t-lg rounded-br-lg shadow-lg"
            src={text}
            onError={(e) => {
              console.error("Error loading video", e);
            }}
            controls
          />
        );
      case "image":
        return (
          <img
            className="max-h-96 rounded-t-lg rounded-br-lg shadow-lg"
            src={text}
            alt="Image message"
            onError={() => {
              console.error("Error loading image");
            }}
          />
        );
      default:
        return <span>{text}</span>;
    }
  }, [text, type]);
};

export default MessageComponent;
