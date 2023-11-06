import { useLocalStorage } from "usehooks-ts";
import { ChatHistory } from "../types";

export default function useChatHistory() {
  const [chatHistory, setChatHistory] = useLocalStorage<ChatHistory>(
    "chatHistory",
    []
  );
  return [chatHistory, setChatHistory] as const;
}
