import {
  Challenge,
  Chat,
  Model,
  ModelChallengeResponse,
  ModelResponse,
} from "../types";
import DatasetManager from "./DatasetManager";

export default class ChatWorker {
  constructor(
    private chat: Chat,
    private model: Model,
    private onChange: () => void
  ) {}

  async run() {
    const datasetManager = new DatasetManager(this.chat.dataset);
    const challenges = datasetManager.getChallenges();

    const modelResponse: ModelResponse = {
      model: this.model,
      challenges: [],
    };
    this.chat.models.push(modelResponse);
    this.onChange();

    for (const challenge of challenges) {
      const challengePrompt = this.generateChallengePrompt(challenge);
      console.log(challengePrompt);

      const challengeEntry = this.createChallengeEntry(
        challenge,
        modelResponse
      );

      const code = await this.generateCode(challengePrompt);
      challengeEntry.code = code;
      challengeEntry.status = "executing";
      this.onChange();

      const success = await this.executeCode(challenge, code);
      challengeEntry.success = success;
      challengeEntry.status = success ? "success" : "error";
      this.onChange();
    }
  }

  private async executeCode(challenge: Challenge, code: string) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return Math.random() > 0.5;
  }

  private async generateCode(challengePrompt: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return "print('hello world')";

    // const response = await fetch("/api/generate", {
    //   method: "POST",
    //   body: JSON.stringify({
    //     prompt: challengePrompt,
    //     model: this.model,
    //   }),
    // });
    // const data = await response.json();
    // return data.response;
  }

  private createChallengeEntry(
    challenge: Challenge,
    modelResponse: ModelResponse
  ) {
    const challengeEntry: ModelChallengeResponse = {
      name: challenge.name,
      code: "",
      status: "generating",
      success: false,
      output: "",
    };
    modelResponse.challenges.push(challengeEntry);
    this.onChange();

    return challengeEntry;
  }

  private generateChallengePrompt(challenge: Challenge) {
    const prompt = this.chat.prompt.replace("[task]", challenge.text);
    return prompt;
  }
}
