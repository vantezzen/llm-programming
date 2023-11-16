"use client";
import ChatLayout from "@/components/chats/ChatLayout";
import ChatView from "@/components/chats/ChatView";
import Overview from "@/components/overview/Overview";
import useCurrentChat from "@/lib/hooks/useCurrentChat";

export default function Home() {
  const [currentChat] = useCurrentChat();

  return <ChatLayout>{currentChat ? <ChatView /> : <Overview />}</ChatLayout>;
}
