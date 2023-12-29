import {
  Challenge,
  Chat,
  Model,
  ModelChallengeResponse,
  ModelResponse,
  TestCaseResult,
} from "../types";
import CodeCleaner from "./CodeCleaner";
import CodeExecutor from "./CodeExecutor";
import DatasetManager from "./DatasetManager";
import PromptTemplate from "./PromptTemplate";
import { v4 as uuid } from "uuid";

export default class ChatWorker {
  private codeCleaner = new CodeCleaner();

  constructor(
    private chat: Chat,
    private model: Model,
    private onChange: () => void
  ) {}

  async run() {
    const datasetManager = new DatasetManager(this.chat.dataset);
    const challenges = datasetManager.getChallenges(this.chat.challengeLimit);

    const modelResponse: ModelResponse = {
      model: this.model,
      challenges: [],
      id: uuid(),
    };
    this.chat.models.push(modelResponse);
    this.onChange();

    const promptTemplate = new PromptTemplate(this.chat);

    for (const challenge of challenges) {
      const challengePrompt = promptTemplate.renderPromptTemplate(challenge);
      console.log(challengePrompt);

      const challengeEntry = this.createChallengeEntry(
        challenge,
        modelResponse
      );

      const { code, rawResponse } = await this.generateCode(
        challengePrompt,
        challenge.codeHead
      ).catch((error) => {
        console.log("Generate Code Error", error);
        challengeEntry.status = "error";
        this.onChange();
        return { code: "_ERROR", rawResponse: "" };
      });
      if (code === "_ERROR") {
        continue;
      }

      // const code = challenge.suggestedCode || "";
      challengeEntry.code = code;
      challengeEntry.rawResponse = rawResponse;
      challengeEntry.status = "executing";
      this.onChange();

      const testResults = await this.executeCode(challenge, code);
      challengeEntry.testCaseResults = testResults;
      challengeEntry.success = testResults.every(
        (result) => result.status === "success"
      );
      challengeEntry.status = challengeEntry.success ? "success" : "error";
      this.onChange();
    }
  }

  private async executeCode(challenge: Challenge, code: string) {
    const codeExecutor = CodeExecutor.getInstance();
    const passesTests = await Promise.race([
      codeExecutor.passesTests(challenge, code),
      new Promise<TestCaseResult[]>((resolve) => {
        setTimeout(() => {
          resolve([
            {
              name: "Timeout",
              status: "error",
              output: "Timeout while executing code",
            },
          ]);
        }, 20000);
      }),
    ]);
    return passesTests;
  }

  private async generateCode(challengePrompt: string, codeHead?: string) {
    const abortController = new AbortController();
    // setTimeout(() => {
    //   abortController.abort();
    // }, 40000);

    const response = await fetch("/api/generate", {
      method: "POST",
      body: JSON.stringify({
        prompt: challengePrompt,
        model: this.model,
      }),
      signal: abortController.signal,
    });
    if (!response.ok) {
      console.log("Generate Code Error", response);
      throw new Error("Generate Code Error");
    }

    const data = await response.json();
    let { code } = data;
    code = code.replace(/```(python)?\n?/g, "");

    let prefix = "";
    if (
      (code.startsWith("\t") || code.startsWith("    ")) &&
      this.chat.addHead
    ) {
      prefix = codeHead + "\n";
    }
    const cleanedCode = this.codeCleaner.clean(prefix + code);

    return {
      code: cleanedCode,
      rawResponse: code,
    };
  }

  private createChallengeEntry(
    challenge: Challenge,
    modelResponse: ModelResponse
  ) {
    const challengeEntry: ModelChallengeResponse = {
      name: challenge.name,
      code: "",
      rawResponse: "",
      status: "generating",
      success: false,
      output: "",
      testCaseResults: [],
      challenge,
    };
    modelResponse.challenges.push(challengeEntry);
    this.onChange();

    return challengeEntry;
  }
}
