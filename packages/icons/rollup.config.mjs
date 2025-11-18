import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { createLibraryConfig } from "../../scripts/build/rollup/createLibraryConfig.mjs";

const packageDir = dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(packageDir, "src");
const entrypoints = fs
  .readdirSync(srcDir)
  .filter((file) => file === "index.ts" || /^[A-Z].*\.ts$/.test(file))
  .map((file) => path.join(srcDir, file));

export default createLibraryConfig({
  packageDir,
  input: entrypoints
});
