"use client";
import React from "react";
import { Button } from "../ui/button";
import { v4 as uuid } from "uuid";
import useChatHistory from "@/lib/hooks/useChatHistory";
import useCurrentChat, { useSetCurrentChat } from "@/lib/hooks/useCurrentChat";
import { cn } from "@/lib/utils";
import { Edit2, X } from "lucide-react";

function ChatLayout({ children }: { children: React.ReactNode }) {
  const [chatHistory, setChatHistory] = useChatHistory();
  const [currentChat, setCurrentChat] = useCurrentChat();
  const setSelectedChat = useSetCurrentChat();

  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="p-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">LLM Programming</h1>
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

                <div className="flex gap-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      const name = prompt("Name", chat.name);
                      if (name) {
                        setChatHistory(
                          chatHistory.map((c) =>
                            c.id === chat.id ? { ...c, name } : c
                          )
                        );
                      }
                    }}
                  >
                    <Edit2 size={12} />
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatHistory(
                        chatHistory.filter((c) => c.id !== chat.id)
                      );
                    }}
                  >
                    <X size={12} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <Button
            className="mt-4 w-full"
            variant="outline"
            onClick={() => {
              const name = prompt("Name");
              if (name) {
                setChatHistory([
                  ...chatHistory,
                  {
                    id: uuid(),
                    name,

                    prompt: "",
                    dataset: "MBPP",
                    challengeLimit: -1,
                    models: [],

                    createdAt: new Date(),
                    updatedAt: new Date(),
                  },
                ]);
              }
            }}
          >
            +
          </Button>
        </aside>
        <main className="w-full overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}

export default ChatLayout;
