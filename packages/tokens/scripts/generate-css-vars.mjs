import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageDir = path.resolve(__dirname, "..");
const distDir = path.join(packageDir, "dist");

const indexPath = path.join(distDir, "index.js");
const cssVarsPath = path.join(distDir, "css-vars.js");

if (!existsSync(indexPath) || !existsSync(cssVarsPath)) {
  console.error(
    "@ara/tokens build 산출물을 찾을 수 없습니다. 먼저 `pnpm --filter @ara/tokens build`를 실행해 주세요."
  );
  process.exit(1);
}

const { tokens } = await import(indexPath);
const { createCSSVariableTable } = await import(cssVarsPath);

function formatBlock(selector, variables) {
  const lines = Object.entries(variables)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");

  return `${selector} {\n${lines}\n}`;
}

const table = createCSSVariableTable(tokens);
const rootBlock = formatBlock(":root", table.root);
const themeBlocks = Object.entries(table.themes).map(([themeName, vars]) =>
  formatBlock(`[data-ara-theme="${themeName}"]`, vars)
);

const css = [rootBlock, ...themeBlocks].join("\n\n");

const outputArg = process.argv[2];

if (outputArg) {
  const outputPath = path.isAbsolute(outputArg)
    ? outputArg
    : path.resolve(process.cwd(), outputArg);

  await writeFile(outputPath, css, "utf8");
} else {
  process.stdout.write(css);
}
