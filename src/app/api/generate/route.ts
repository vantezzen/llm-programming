import { OpenAI } from "langchain/llms/openai";
import { Fireworks } from "langchain/llms/fireworks";

import { Model } from "@/lib/types";

export async function POST(request: Request) {
  const res = await request.json();
  const { prompt, model } = res;

  const llm = getLlm(model);
  const llmResult = await llm.invoke(prompt);

  return Response.json({ code: llmResult });
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
        modelName: "accounts/fireworks/models/starcoder-16b-w8a16",
        fireworksApiKey: process.env.FIREWORKS_API_KEY,
      });
    default:
      throw new Error(`Unknown model ${model}`);
  }
}
