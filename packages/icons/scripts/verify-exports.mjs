#!/usr/bin/env node
import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

function toPascalCase(value) {
  return value
    .replace(/\.js$/i, "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
}

async function main() {
  const packageDir = path.resolve(process.cwd());
  const distDir = path.join(packageDir, "dist");
  const iconsDir = path.join(distDir, "icons");
  const importerUrl = pathToFileURL(path.join(distDir, "index.js")).href;

  await fs.access(distDir);
  await fs.access(path.join(distDir, "index.js"));

  const iconFiles = (await fs.readdir(iconsDir)).filter((file) =>
    file.endsWith(".js")
  );

  if (iconFiles.length === 0) {
    throw new Error("빌드된 아이콘 엔트리포인트가 없습니다.");
  }

  const iconNames = iconFiles.map((file) => toPascalCase(file));
  const resolveFromPackage = (specifier) =>
    import.meta.resolve(specifier, importerUrl);

  const rootModule = await import(await resolveFromPackage("@ara/icons"));

  for (const iconName of iconNames) {
    assert(
      iconName in rootModule,
      `패키지 루트에서 ${iconName} export를 찾을 수 없습니다.`
    );
  }

  for (const iconName of iconNames) {
    const entrypointUrl = await resolveFromPackage(`@ara/icons/${iconName}`);
    const module = await import(entrypointUrl);

    assert(
      iconName in module,
      `${iconName} 엔트리포인트에서 ${iconName} export를 찾을 수 없습니다.`
    );
  }

  for (const file of iconFiles) {
    const kebab = path.basename(file, ".js");
    await import(await resolveFromPackage(`@ara/icons/icons/${kebab}`));
  }

  await import(await resolveFromPackage("@ara/icons/types"));

  console.log(
    `[OK] exports 해상도가 확인되었습니다. (${iconNames.join(", ")})`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
