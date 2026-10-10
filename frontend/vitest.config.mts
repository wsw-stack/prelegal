import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  // Tests run in Node by default; component tests opt into jsdom with a
  // `// @vitest-environment jsdom` comment.
  test: { setupFiles: ["./vitest.setup.ts"] },
});
