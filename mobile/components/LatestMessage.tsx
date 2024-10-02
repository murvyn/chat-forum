import { Message } from "@/types";

const LatestMessage = ({ message, isUser }: { message: Message, isUser: boolean }) => {
  switch (message.type) {
    case "text":
      return isUser ? "You: "+  message.text: message.text;
    case "document":
      return isUser ? "You: Document": "Document";
    case "audio":
      return isUser ? "You: Audio message": "Audio message";
    case "video":
      return isUser ? "You: Video": "Video";
    case "image":
      return isUser ? "You: Image": "Image";
    default:
      return message.text;
  }
};

export default LatestMessage;
