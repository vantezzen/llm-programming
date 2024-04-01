import Dashboard from "@/components/Dashboard";
import { ChatProvider } from "@/lib/ChatContext";
import getChats from "@/lib/getChats";

export default async function Home() {
  const chats = await getChats();

  return (
    <ChatProvider value={chats}>
      <Dashboard />
    </ChatProvider>
  );
}
