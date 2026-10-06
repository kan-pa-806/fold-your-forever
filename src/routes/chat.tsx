import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/fold/AppShell";
import { ChatRoom } from "@/components/fold/ChatRoom";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Quiet Whispers — 11:FOLD 1-on-1 Chat" },
      {
        name: "description",
        content:
          "Private real-time space for two. Share words, photos, whispers and fold any moment into forever.",
      },
      { property: "og:title", content: "Quiet Whispers — 11:FOLD 1-on-1 Chat" },
      {
        property: "og:description",
        content: "A private space for two. Chat, feelings, moments, memories.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  return (
    <AppShell className="p-0 flex flex-col h-full" desktopWide>
      <ChatRoom />
    </AppShell>
  );
}
