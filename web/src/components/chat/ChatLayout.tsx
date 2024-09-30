import { Chat } from "./Chat";

export function ChatLayout({ type }: { type: "direct" | "course" }) {
  return (
    <div className=" h-[calc(100dvh)] overflow-y-hidden w-full">
      <Chat type={type} />
    </div>
  );
}
