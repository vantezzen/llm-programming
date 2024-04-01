"use client";
import useCurrentChat from "@/lib/hooks/useCurrentChat";
import React from "react";
import ChatLayout from "./chats/ChatLayout";
import ChatView from "./chats/ChatView";
import Overview from "./overview/Overview";

function Dashboard() {
  const currentChat = useCurrentChat();

  return <ChatLayout>{currentChat ? <ChatView /> : <Overview />}</ChatLayout>;
}

export default Dashboard;
