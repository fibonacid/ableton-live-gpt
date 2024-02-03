import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    setupFiles: ["__tests__/setup.ts"],
    includeSource: ["src/**/*.ts"],
    alias: {
      "max-api": resolve("__mocks__/max-api.ts"),
    },
  },
});
