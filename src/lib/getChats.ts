import { Chat, ChatHistory, ModelResponse, Models } from "@/lib/types";
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

export default async function getChats() {
  const chats: ChatHistory = [];

  const basedir = join(process.env.BASEDIR!, "./data/chats");
  const files = await readdir(basedir);
  for (const file of files) {
    if (file.startsWith(".")) continue;
    console.log(`Loading chat ${file}...`);
    const chatdir = join(basedir, file);
    const config = JSON.parse(
      await readFile(`${chatdir}/config.json`, "utf-8")
    );
    const prompt = await readFile(`${chatdir}/prompt.tpl`, "utf-8");

    const chatModels: ModelResponse[] = [];
    for (const model of Models) {
      const modelFile = join(chatdir, "models", `${model}.json`);
      const hasModel = (await stat(modelFile)).isFile();
      if (hasModel) {
        const modelData = JSON.parse(
          await readFile(`${chatdir}/models/${model}.json`, "utf-8")
        );
        chatModels.push(modelData);
      }
    }

    chats.push(
      minimizeChat({
        id: file,
        ...config,
        prompt,
        models: chatModels,
      })
    );
  }

  return chats;
}

export async function getChat(id: string): Promise<Chat> {
  const basedir = join(process.env.BASEDIR!, "./data/chats");
  const chatdir = join(basedir, id);
  const config = JSON.parse(await readFile(`${chatdir}/config.json`, "utf-8"));
  const prompt = await readFile(`${chatdir}/prompt.tpl`, "utf-8");

  const chatModels: ModelResponse[] = [];
  for (const model of Models) {
    const modelFile = join(chatdir, "models", `${model}.json`);
    const hasModel = (await stat(modelFile)).isFile();
    if (hasModel) {
      const modelData = JSON.parse(
        await readFile(`${chatdir}/models/${model}.json`, "utf-8")
      );
      chatModels.push(modelData);
    }
  }

  return {
    id,
    ...config,
    prompt,
    models: chatModels,
  };
}

function minimizeChat(chat: Chat): Chat {
  // Remove unnecessary data from the chat object for rendering an overview
  return {
    id: chat.id,
    name: chat.name,
    prompt: chat.prompt,
    addHead: chat.addHead,

    models: chat.models.map((model) => ({
      id: model.id,
      model: model.model,
      pendingChallenges: [],
      inProgressChallenges: [],
      challenges: model.challenges.map((challenge) => ({
        name: challenge.name,
        code: challenge.code.slice(0, 100) + "...",
        rawResponse: challenge.rawResponse.slice(0, 100) + "...",
        success: challenge.success,
        output: challenge.output.slice(0, 100) + "...",
        testCaseResults: challenge.testCaseResults.map((testCase) => ({
          name: testCase.name,
          status: testCase.status,
          output: testCase.output.slice(0, 100) + "...",
        })),
        challenge: challenge.challenge,
      })),
    })),
  };
}
