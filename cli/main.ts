import Chats from "./src/ChatManager";

const chats = new Chats();
await chats.loadChats();

console.log("Chats loaded!");

for (const chat of chats.chats) {
  for (const model of chat.models) {
    const workerURL = new URL("src/worker.ts", import.meta.url).href;
    const worker = new Worker(workerURL);

    worker.postMessage({
      chat,
      model: model.model,
    });
  }
}

setInterval(() => {
  console.log("Main thread is still alive!");
}, 100000);
