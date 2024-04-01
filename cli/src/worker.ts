import ChatManager from "./ChatManager";
import ChatWorker from "./ChatWorker";

declare var self: Worker;

const manager = new ChatManager();
self.onmessage = (event: MessageEvent) => {
  console.log("Hello from worker!");

  const worker = new ChatWorker(manager, event.data.chat, event.data.model);
  worker.run();
};
