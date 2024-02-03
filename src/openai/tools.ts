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

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("should have all function definitions", () => {
    expect(tools).toHaveLength(Object.keys(functionDefinitions).length);
  });
}
