import { readdir } from "node:fs/promises";
import mbppDataset from "../../src/data/programming-sets/mbpp.json";
import type {
  ModelResponse,
  Chat,
  Challenge,
  Model,
  ModelChallengeResponse,
} from "../../src/lib/types";
import { Models } from "../../src/lib/types";
import { join } from "node:path";

export default class ChatManager {
  chats: Chat[] = [];
  allChallenges = mbppDataset.map((challenge, i) => ({
    name: challenge.text,
    text: challenge.text,
    testCode: {
      setupCode: challenge.test_setup_code,
      testList: challenge.test_list,
    },
    suggestedCode: challenge.code,
    codeHead: /def \w+\(.*\):/.exec(challenge.code)?.[0] || "",
  }));

  async loadChats() {
    console.log("Initializing chats...");

    const files = await readdir(join(import.meta.dir, "/../../data/chats"));
    for (const file of files) {
      if (file.startsWith(".")) continue;
      console.log(`Loading chat ${file}...`);
      const basedir = join(import.meta.dir, "/../../data/chats/", file);
      const config = (await import(`${basedir}/config.json`)).default;
      const prompt = await Bun.file(`${basedir}/prompt.tpl`).text();

      const chatModels: ModelResponse[] = [];
      for (const model of Models) {
        const hasModel = await Bun.file(
          `${basedir}/models/${model}.json`
        ).exists();
        if (hasModel) {
          const modelData = await Bun.file(
            `${basedir}/models/${model}.json`
          ).json();
          chatModels.push(modelData);

          if (modelData.inProgressChallenges.length) {
            console.log(
              `WARNING: ${model} has ${modelData.inProgressChallenges.length} in progress challenges in ${file}. Putting them back in pending.`
            );
            modelData.pendingChallenges.push(...modelData.inProgressChallenges);
            modelData.inProgressChallenges = [];
            await Bun.write(
              `${basedir}/models/${model}.json`,
              JSON.stringify(modelData, null, 2)
            );
          }
        } else {
          const modelData = {
            id: model,
            model,
            challenges: [],
            inProgressChallenges: [],
            pendingChallenges: this.allChallenges.slice(),
          };
          chatModels.push(modelData);

          await Bun.write(
            `${basedir}/models/${model}.json`,
            JSON.stringify(modelData, null, 2)
          );

          console.log(
            `INFO: ${model} has been initialized with ${modelData.pendingChallenges.length} challenges in ${file}.`
          );
        }
      }

      this.chats.push({
        id: file,
        ...config,
        prompt,
        models: chatModels,
      });
    }
  }

  async getNewChallenge(chat: Chat, model: Model) {
    const basedir = join(import.meta.dir, "/../../data/chats/", chat.id);
    const modelData = await Bun.file(`${basedir}/models/${model}.json`).json();

    if (!modelData.pendingChallenges.length) {
      console.log(`No pending challenges for ${model} in ${chat.id}.`);
      return null;
    }

    const challenge = modelData.pendingChallenges.shift();
    modelData.inProgressChallenges.push(challenge);

    await Bun.write(
      `${basedir}/models/${model}.json`,
      JSON.stringify(modelData, null, 2)
    );

    return challenge;
  }

  async saveChallengeResponse(
    chat: Chat,
    model: Model,
    challenge: Challenge,
    response: ModelChallengeResponse
  ) {
    const basedir = join(import.meta.dir, "/../../data/chats/", chat.id);

    const modelData = (await Bun.file(
      `${basedir}/models/${model}.json`
    ).json()) as ModelResponse;

    const challengeIndex = modelData.inProgressChallenges.findIndex(
      (c) => c.name === challenge.name
    );
    if (challengeIndex === -1) {
      throw new Error("Challenge not found in inProgressChallenges");
    }

    modelData.inProgressChallenges.splice(challengeIndex, 1);
    modelData.challenges.push(response);

    await Bun.write(
      `${basedir}/models/${model}.json`,
      JSON.stringify(modelData, null, 2)
    );
  }
}
