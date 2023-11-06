import { useLocalStorage } from "usehooks-ts";
import { Chat, ChatHistory } from "../types";
import useChatHistory from "./useChatHistory";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function useCurrentChat() {
  const [chatHistory, setChatHistory] = useChatHistory();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId");

  const currentChat = chatHistory.find((chat) => chat.id === chatId);
  const setCurrentChat = (newChat: Chat) => {
    const newChatHistory = chatHistory.map((chat) =>
      chat.id === chatId ? newChat : chat
    );
    setChatHistory(newChatHistory);
  };
  return [currentChat, setCurrentChat] as const;
}

export function useSetCurrentChat() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams()!;

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const setCurrentChat = (chatId: string | null) => {
    router.push(pathname + "?" + createQueryString("chatId", chatId ?? ""));
  };

  return setCurrentChat;
}
