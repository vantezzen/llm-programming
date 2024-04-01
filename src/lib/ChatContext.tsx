"use client";
import { createContext, use, useState } from "react";
import { ChatHistory } from "./types";

export const ChatContext = createContext<{
  chatHistory: ChatHistory;
  setChatHistory: (chatHistory: ChatHistory) => void;
}>({
  chatHistory: [],
  setChatHistory: () => {},
});
export default function useChats() {
  return use(ChatContext).chatHistory;
}

export function ChatProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: ChatHistory;
}) {
  const [chatHistory, setChatHistory] = useState(value);

  return (
    <ChatContext.Provider
      value={{
        chatHistory,
        setChatHistory,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
