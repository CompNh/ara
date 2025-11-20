import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { createLibraryConfig } from "../../scripts/build/rollup/createLibraryConfig.mjs";

const packageDir = dirname(fileURLToPath(import.meta.url));
const input = [
  join(packageDir, "src/index.ts"),
  join(packageDir, "src/components/index.ts"),
  join(packageDir, "src/components/layout/index.ts"),
  join(packageDir, "src/components/spacer/index.tsx"),
  join(packageDir, "src/components/theme-provider/index.tsx"),
  join(packageDir, "src/theme/index.ts")
];

export default createLibraryConfig({
  packageDir,
  input
});
