import path from "node:path";
import type { NextConfig } from "next";

// The repo root, so the app can import the shared ../templates dataset.
const repoRoot = path.join(__dirname, "..");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  outputFileTracingRoot: repoRoot,
  turbopack: {
    root: repoRoot,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
      // `import text from "./file.md?raw"` bundles the file contents as a string.
      "*.md": { condition: { query: "?raw" }, type: "text" },
    },
  },
};

export default nextConfig;
