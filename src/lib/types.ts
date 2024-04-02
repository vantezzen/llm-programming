import { z } from "zod";

export const DataSets = ["MBPP"] as const;
export type DataSet = (typeof DataSets)[number];
export const Models = [
  "GPT3",
  "GPT4",
  "LLAMA",
  "LLAMA Code",
  "Starcoder",
  "Google Text Bison",
  "Google Code Bison",
  "Google Gemini",
] as const;
export type Model = (typeof Models)[number];

export const commonLibraries = ["math", "re", "heapq", "bisect"];

export const ChallengeSchema = z.object({
  name: z.string(),
  text: z.string(),
  testCode: z.object({
    setupCode: z.string(),
    testList: z.array(z.string()),
  }),
  suggestedCode: z.string().optional(),
  codeHead: z.string().optional(),
});
export type Challenge = z.infer<typeof ChallengeSchema>;

export const TestCaseResultSchema = z.object({
  name: z.string(),
  status: z.enum(["success", "error", "SyntaxError", "AssertionError"]),
  output: z.string(),
});
export type TestCaseResult = z.infer<typeof TestCaseResultSchema>;

export const ModelChallengeResponseSchema = z.object({
  name: z.string(),
  code: z.string(), // Code content returned by model
  success: z.boolean(),
  output: z.string(),
  rawResponse: z.string(),
  testCaseResults: z.array(TestCaseResultSchema),
  challenge: ChallengeSchema,
});
export type ModelChallengeResponse = z.infer<
  typeof ModelChallengeResponseSchema
>;

export const ModelResponseSchema = z.object({
  id: z.string(),
  model: z.enum(Models),
  challenges: z.array(ModelChallengeResponseSchema),
  pendingChallenges: z.array(ChallengeSchema),
  inProgressChallenges: z.array(ChallengeSchema),
});
export type ModelResponse = z.infer<typeof ModelResponseSchema>;

export const ChatSchema = z.object({
  id: z.string(),
  name: z.string(),

  prompt: z.string(),
  addHead: z.boolean().default(false),

  models: z.array(ModelResponseSchema),
});
export type Chat = z.infer<typeof ChatSchema>;

export const ChatHistorySchema = z.array(ChatSchema);
export type ChatHistory = z.infer<typeof ChatHistorySchema>;
