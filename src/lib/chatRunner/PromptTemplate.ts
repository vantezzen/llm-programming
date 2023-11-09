import { Challenge, Chat } from "../types";
import DatasetManager from "./DatasetManager";

export default class PromptTemplate {
  private allChallenges: Challenge[] = [];
  constructor(private chat: Chat) {
    const datasetManager = new DatasetManager(this.chat.dataset);
    this.allChallenges = datasetManager.getChallenges();
  }

  renderPromptTemplate(challenge: Challenge) {
    let prompt = this.chat.prompt;

    prompt = this.addTask(prompt, challenge);
    prompt = this.addHead(prompt, challenge);
    prompt = this.addShots(prompt, challenge);
    prompt = this.addTests(prompt, challenge);

    return prompt;
  }

  private addTask(prompt: string, challenge: Challenge) {
    prompt = prompt.replace("[task]", challenge.text);
    return prompt;
  }

  private addHead(prompt: string, challenge: Challenge) {
    const head = challenge.codeHead || "";
    prompt = prompt.replace("[head]", head);
    return prompt;
  }

  private addShots(prompt: string, challenge: Challenge) {
    // The prompt may contain a placeholder like "[shots:3]".
    // This will be replaced with the correct number of shots.

    const shots = prompt.match(/\[shots:(\d+)\]/);
    if (!shots) return prompt;

    const shotsCount = parseInt(shots[1]);
    const shotsText = this.getShotsText(shotsCount, challenge);
    prompt = prompt.replace(/\[shots:\d+\]/, shotsText);

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

      const shotInfo = `Task: ${shotChallenge.text}\nCode:\n---\n${
        shotChallenge.suggestedCode
      }\n---\nTests:\n---\n${
        shotChallenge.testCode.setupCode
      }\n${shotChallenge.testCode.testList.join("\n")}\n---\n`;
      shotsText += shotInfo;
    }

    return shotsText;
  }

  private getRandomChallenge(): Challenge {
    const index = Math.floor(Math.random() * this.allChallenges.length);
    return this.allChallenges[index];
  }

  private addTests(prompt: string, challenge: Challenge) {
    const tests = prompt.match(/\[tests\]/);
    if (!tests) return prompt;

    const testsText = this.getTestsText(challenge);
    prompt = prompt.replace(/\[tests\]/, testsText);

    return prompt;
  }

  private getTestsText(challenge: Challenge) {
    const testsText = challenge.testCode.testList.join("\n");
    return testsText;
  }
}
