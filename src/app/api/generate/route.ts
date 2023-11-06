import { OpenAI } from "langchain/llms/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
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
    default:
      throw new Error(`Unknown model ${model}`);
  }
}
