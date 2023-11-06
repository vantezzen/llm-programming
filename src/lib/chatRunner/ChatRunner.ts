import { Chat, Models } from "../types";
import ChatWorker from "./ChatWorker";

export default class ChatRunner {
  async runChat(chat: Chat, onChange: () => void) {
    let workers = [];
    for (const model of Models) {
      const worker = new ChatWorker(chat, model, onChange);
      workers.push(worker);
    }

    await Promise.all(workers.map((worker) => worker.run()));
  }
}
