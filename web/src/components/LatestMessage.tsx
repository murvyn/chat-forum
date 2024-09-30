import { Message } from "@/types";

const LatestMessage = ({ message }: { message: Message }) => {
  switch (message.type) {
    case "text":
      return <p>{message.text}</p>;
    case "document":
      return <a href={message.text}>Document</a>;
    case "audio":
      return <p>Audio message</p>;
    case "video":
      return <p>Video</p>;
    case "image":
      return <p>Image</p>;
    default:
      return <p>{message.text}</p>;
  }
};

export default LatestMessage;
