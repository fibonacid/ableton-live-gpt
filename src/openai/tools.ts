import { ChatCompletionTool } from "openai/resources/index.mjs";
import { functionDefinitions } from "./functions";

export const tools: ChatCompletionTool[] = Object.values(
  functionDefinitions
).map((definition) => {
  return {
    type: "function",
    function: definition,
  };
});
