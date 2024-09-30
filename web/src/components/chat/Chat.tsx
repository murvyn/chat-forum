
import ChatTopBar from "./ChatTopBar";
import { ChatList } from "./ChatList";

export function Chat({ type }: { type: "direct" | "course" }) {
  return (
    <div className="flex flex-col justify-between w-full h-full">
      <ChatTopBar type={type} />
      <ChatList />
    </div>
  );
}
