import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tokensRoot = path.resolve(__dirname, "../tokens/src");
const iconsRoot = path.resolve(__dirname, "../icons/src");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@ara/tokens/css-vars",
        replacement: path.resolve(tokensRoot, "css-vars.ts")
      },
      {
        find: "@ara/tokens/colors",
        replacement: path.resolve(tokensRoot, "colors.ts")
      },
      {
        find: "@ara/tokens",
        replacement: path.resolve(tokensRoot, "index.ts")
      },
      {
        find: /^@ara\/icons\/(.*)$/,
        replacement: path.resolve(iconsRoot, "$1")
      },
      {
        find: "@ara/icons",
        replacement: path.resolve(iconsRoot, "index.ts")
      }
    ]
  },
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    globals: true
  }
});
