import path from "node:path";
import type { NextConfig } from "next";

// The repo root, so the app can import the shared ../templates dataset.
const repoRoot = path.join(__dirname, "..");

const nextConfig: NextConfig = {
  // Built to static files in out/ and served by the FastAPI backend. Static
  // export rules out cacheComponents/partial prerendering.
  output: "export",
  // Emit login/index.html rather than login.html, so the backend's static file
  // server can resolve /login/.
  trailingSlash: true,
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
