import { Chat } from "../types";
import ChatWorker from "./ChatWorker";

export default class ChatRunner {
  async runChat(chat: Chat, onChange: () => void) {
    for (const model of chat.requestedModels) {
      const worker = new ChatWorker(chat, model, onChange);
      await worker.run();
    }
  }
}
