import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

const currentDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: [
        resolve(currentDir, "tsconfig.json"),
        resolve(currentDir, "../../tsconfig.base.json")
      ]
    }),
    react()
  ],
  resolve: {
    alias: [
      {
        find: "@ara/react/button",
        replacement: resolve(
          currentDir,
          "../../packages/react/src/components/button/index.ts"
        )
      },
      {
        find: "@ara/react/components",
        replacement: resolve(
          currentDir,
          "../../packages/react/src/components/index.ts"
        )
      },
      {
        find: "@ara/react/components/",
        replacement: `${resolve(
          currentDir,
          "../../packages/react/src/components"
        )}/`
      },
      {
        find: "@ara/react",
        replacement: resolve(currentDir, "../../packages/react/src")
      },
      {
        find: "@ara/react/",
        replacement: `${resolve(currentDir, "../../packages/react/src")}/`
      },
      {
        find: "@ara/core",
        replacement: resolve(currentDir, "../../packages/core/src")
      },
      {
        find: "@ara/core/",
        replacement: `${resolve(currentDir, "../../packages/core/src")}/`
      },
      {
        find: "@ara/tokens",
        replacement: resolve(currentDir, "../../packages/tokens/src")
      },
      {
        find: "@ara/tokens/",
        replacement: `${resolve(currentDir, "../../packages/tokens/src")}/`
      }
    ]
  },
  server: {
    port: 5173
  }
});
