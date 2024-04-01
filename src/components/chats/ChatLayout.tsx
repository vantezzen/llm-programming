"use client";
import React from "react";
import { Button } from "../ui/button";
import { v4 as uuid } from "uuid";
import useChatHistory from "@/lib/hooks/useChatHistory";
import useCurrentChat, { useSetCurrentChat } from "@/lib/hooks/useCurrentChat";
import { cn } from "@/lib/utils";
import { Download, Edit2, Upload, X } from "lucide-react";
import { Models } from "@/lib/types";
import { saveAs } from "file-saver";
import useChats from "@/lib/ChatContext";
import ChatRefresh from "../ChatRefresh";

function ChatLayout({ children }: { children: React.ReactNode }) {
  const chatHistory = useChats();
  const currentChat = useCurrentChat();
  const setSelectedChat = useSetCurrentChat();

  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="p-4 bg-white border-b border-gray-200 flex gap-3 items-center">
        <h1
          className="text-xl font-bold text-gray-900 cursor-pointer"
          onClick={() => {
            setSelectedChat(null);
          }}
        >
          LLM Programming
          <ChatRefresh />
        </h1>
      </header>
      <div className="flex flex-grow overflow-hidden">
        <aside className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {chatHistory.length === 0 && (
              <li className="text-gray-500 text-center font-medium">
                No chat's yet
              </li>
            )}

            {chatHistory.map((chat, i) => (
              <li
                key={i}
                className={cn(
                  "p-3 rounded hover:bg-gray-100 cursor-pointer flex justify-between items-center gap-3",
                  currentChat?.id === chat.id && "border border-zinc-200"
                )}
                onClick={() => setSelectedChat(chat.id)}
              >
                {chat.name}
              </li>
            ))}
          </ul>
        </aside>
        <main className="w-full overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}

export default ChatLayout;
