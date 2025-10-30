import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { createLibraryConfig } from "../../scripts/build/rollup/createLibraryConfig.mjs";

const packageDir = dirname(fileURLToPath(import.meta.url));

export default createLibraryConfig({
  packageDir
});
