import type {
  Challenge,
  Chat,
  Model,
  ModelChallengeResponse,
  TestCaseResult,
} from "../../src/lib/types";
import CodeCleaner from "./CodeCleaner";
import CodeExecutor from "./CodeExecutor";
import PromptTemplate from "./PromptTemplate";
import type ChatManager from "./ChatManager";
import { getCode } from "./CodeGenerator";

export default class ChatWorker {
  private codeCleaner = new CodeCleaner();
  private log = (...args: any[]) =>
    console.log(`[${this.chat.id}][${this.model}]`, ...args);

  constructor(
    private manager: ChatManager,
    private chat: Chat,
    private model: Model
  ) {}

  async run() {
    const promptTemplate = new PromptTemplate(this.chat, this.manager);

    let challenge: Challenge | undefined;
    while (
      (challenge = await this.manager.getNewChallenge(this.chat, this.model))
    ) {
      this.log(`Running challenge ${challenge.name}`);

      const challengePrompt = promptTemplate.renderPromptTemplate(challenge);
      const challengeEntry = this.createChallengeEntry(challenge);

      this.log(`Generating code for challenge ${challenge.name}`);
      const { code, rawResponse } = await this.generateCode(
        challengePrompt,
        challenge.codeHead
      ).catch((error) => {
        this.log("Generate Code Error", error);
        challengeEntry.success = false;
        return { code: "_ERROR", rawResponse: "" };
      });
      if (code === "_ERROR") {
        continue;
      }
      challengeEntry.code = code;
      challengeEntry.rawResponse = rawResponse;

      this.log(`Executing code for challenge ${challenge.name}`);
      const testResults = (await this.executeCode(challenge, code).catch(
        (error) => {
          this.log("Execute Code Error", error);
          challengeEntry.success = false;
          return [
            {
              name: "Error",
              status: "error",
              output: "Error while executing code",
            },
          ];
        }
      )) as TestCaseResult[];
      challengeEntry.testCaseResults = testResults;
      challengeEntry.success = testResults.every(
        (result) => result.status === "success"
      );

      this.log(`Challenge ${challenge.name} complete`);

      await this.manager.saveChallengeResponse(
        this.chat,
        this.model,
        challenge,
        challengeEntry
      );
    }
  }

  private async executeCode(challenge: Challenge, code: string) {
    const codeExecutor = new CodeExecutor();
    return await codeExecutor.passesTests(challenge, code);
  }

  private async generateCode(challengePrompt: string, codeHead?: string) {
    const abortController = new AbortController();
    // setTimeout(() => {
    //   abortController.abort();
    // }, 40000);

    let code = await getCode(challengePrompt, this.model).catch((error) => {
      this.log("Get Code Error", error);
      return "_ERROR";
    });
    if (code === "_ERROR") {
      return { code: "_ERROR", rawResponse: "" };
    }
    code = code.replace(/```(python)?\n?/g, "");
    code = code.replace(/^\n+/g, "");

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

  private createChallengeEntry(challenge: Challenge) {
    const challengeEntry: ModelChallengeResponse = {
      name: challenge.name,
      code: "",
      rawResponse: "",
      success: false,
      output: "",
      testCaseResults: [],
      challenge,
    };

    return challengeEntry;
  }
}
