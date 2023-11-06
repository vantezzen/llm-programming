"use client";
import ChatLayout from "@/components/chats/ChatLayout";
import ChatView from "@/components/chats/ChatView";
import useCurrentChat from "@/lib/hooks/useCurrentChat";

export default function Home() {
  const [currentChat] = useCurrentChat();

  return <ChatLayout>{currentChat && <ChatView />}</ChatLayout>;
}
