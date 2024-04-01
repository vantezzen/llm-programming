import {
  type Challenge,
  type Chat,
  commonLibraries,
} from "../../src/lib/types";
import type ChatManager from "./ChatManager";

export default class PromptTemplate {
  constructor(private chat: Chat, private manager: ChatManager) {}

  renderPromptTemplate(challenge: Challenge) {
    let prompt = this.chat.prompt;

    // These variables are available in the prompt
    const task = challenge.text;
    const head = challenge.codeHead || "";
    const shots = (amount: number) => this.getShotsText(amount, challenge);
    const tests = this.getTestsText(challenge);
    const libraries = commonLibraries;

    // The prompt contains values in brackets, e.g. [task]
    // These should be "eval"ed to get the value of the variable
    // while also allowing executing code in the prompt (e.g. "task.replace('a', 'b')")
    // eslint-disable-next-line no-eval
    const placeholders = prompt.match(/\[.*?\]/g);
    if (placeholders) {
      for (const placeholder of placeholders) {
        // Remove brackets
        const placeholderName = placeholder.slice(1, -1);
        // eslint-disable-next-line no-eval
        const placeholderValue = eval(placeholderName);
        prompt = prompt.replace(placeholder, placeholderValue);
      }
    }

    return prompt;
  }

  private getShotsText(shotsCount: number, challenge: Challenge) {
    let shotsText = "";
    let usedChallenges = [challenge.name];

    for (let i = 0; i < shotsCount; i++) {
      let shotChallenge;
      do {
        shotChallenge = this.getRandomChallenge();
      } while (usedChallenges.includes(shotChallenge.name));

      usedChallenges.push(shotChallenge.name);

      const shotInfo = `Task: ${shotChallenge.text}\n---\nTests:\n${
        shotChallenge.testCode.setupCode
      }\n${shotChallenge.testCode.testList.join("\n")}\n---\nCode:\n${
        shotChallenge.suggestedCode
      }\n---\n`;
      shotsText += shotInfo;
    }

    return shotsText;
  }

  private getRandomChallenge(): Challenge {
    const index = Math.floor(Math.random() * this.manager.allChallenges.length);
    return this.manager.allChallenges[index];
  }

  private getTestsText(challenge: Challenge) {
    const testsText = challenge.testCode.testList.join("\n");
    return testsText;
  }
}
