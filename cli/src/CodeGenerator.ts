import { OpenAI } from "langchain/llms/openai";
import { Fireworks } from "langchain/llms/fireworks";
import {
  GoogleVertexAI,
  type GoogleVertexAITextInput,
} from "langchain/llms/googlevertexai";
import type { Model } from "../../src/lib/types";

const credentials = JSON.parse(
  Buffer.from(
    process.env.GOOGLE_VERTEX_AI_WEB_CREDENTIALS!.replace(/\n/g, ""),
    "base64"
  ).toString()
);
const googleAuth: GoogleVertexAITextInput = {
  authOptions: {
    credentials,
    projectId: credentials.project_id,
  },
};

export async function getCode(prompt: string, model: Model) {
  const llm = getLlm(model);
  const llmResult = await llm.invoke(prompt);
  return llmResult;
}

function getLlm(model: Model) {
  switch (model) {
    case "GPT3":
      return new OpenAI({
        modelName: "gpt-3.5-turbo",
      });
    case "GPT4":
      return new OpenAI({
        modelName: "gpt-4-1106-preview",
      });
    case "LLAMA":
      return new Fireworks({
        fireworksApiKey: process.env.FIREWORKS_API_KEY,
      });
    case "LLAMA Code":
      return new Fireworks({
        modelName: "accounts/fireworks/models/llama-v2-34b-code-instruct",
        fireworksApiKey: process.env.FIREWORKS_API_KEY,
      });
    case "Starcoder":
      return new Fireworks({
        modelName: "accounts/fireworks/models/starcoder-16b",
        fireworksApiKey: process.env.FIREWORKS_API_KEY,
      });
    case "Google Text Bison":
      return new GoogleVertexAI({
        model: "text-bison",
        ...googleAuth,
      });
    case "Google Code Bison":
      return new GoogleVertexAI({
        model: "code-bison",
        ...googleAuth,
      });
    // case "Google Gemini":
    //   return new GoogleVertexAI({
    //     model: "gemini-pro",
    //     ...googleAuth,
    //   });
    default:
      throw new Error(`Unknown model ${model}`);
  }
}
