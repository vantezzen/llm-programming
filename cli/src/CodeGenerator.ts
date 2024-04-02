import { OpenAI } from "langchain/llms/openai";
import { Fireworks } from "langchain/llms/fireworks";
import {
  GoogleVertexAI,
  type GoogleVertexAITextInput,
} from "langchain/llms/googlevertexai";
import type { Model } from "../../src/lib/types";
import { VertexAI } from "@google-cloud/vertexai";

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
  if (model === "Google Gemini") {
    // Google Gemini is currently highly rate limited
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const vertexAI = new VertexAI({
      project: credentials.project_id,
      googleAuthOptions: {
        credentials,
      },
      location: "us-central1",
    });
    const model = vertexAI.getGenerativeModel({
      model: "gemini-1.0-pro",
    });
    const resp = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const textContent = resp.response.candidates[0].content.parts
      .map((p) => p.text)
      .join("");
    return textContent;
  }

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
        modelName: "gpt-4-turbo-preview",
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
    default:
      throw new Error(`Unknown model ${model}`);
  }
}
