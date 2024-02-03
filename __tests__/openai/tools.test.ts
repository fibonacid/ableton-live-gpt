import { functionDefinitions } from "@/openai/functions";
import { tools } from "@/openai/tools";

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("should have all function definitions", () => {
    expect(tools).toHaveLength(Object.keys(functionDefinitions).length);
  });
}
