import { OpenAI } from "langchain/llms/openai";
import { CloudflareWorkersAI } from "langchain/llms/cloudflare_workersai";

import { Model } from "@/lib/types";

export async function POST(request: Request) {
  const res = await request.json();
  const { prompt, model } = res;

  const llm = getLlm(model);
  const llmResult = await llm.predict(prompt);

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
      return new CloudflareWorkersAI({
        model: "@cf/meta/llama-2-7b-chat-int8",
        cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
        cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN,
      });
    default:
      throw new Error(`Unknown model ${model}`);
  }
}
