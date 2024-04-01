import { useLocalStorage } from "usehooks-ts";
import { ChatHistory } from "../types";
import useChats from "../ChatContext";

export default function useChatHistory() {
  const chatHistory = useChats();
  return [chatHistory, () => {}] as const;
}
