import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    include: ["__tests__/**/*.test.ts"],
    setupFiles: ["__tests__/setup.ts"],
    alias: {
      "max-api": resolve("__mocks__/max-api.ts"),
    },
  },
});
