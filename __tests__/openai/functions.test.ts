import { functionDefinitions, functionMap } from "@/openai/functions";
import { it, expect } from "vitest";

it("should have all function definitions", () => {
  expect(Object.keys(functionMap)).toEqual(Object.keys(functionDefinitions));
});
