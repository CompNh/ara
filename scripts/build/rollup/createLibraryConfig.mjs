import fs from "node:fs";
import path from "node:path";

import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";

const DEFAULT_EXTENSIONS = [".mjs", ".js", ".json", ".ts", ".tsx"];
const DEFAULT_EXTERNAL = new Set([
  "react",
  "react-dom",
  "react/jsx-runtime"
]);

function loadPackageJson(packageDir) {
  const packageJsonPath = path.join(packageDir, "package.json");

  return JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
}

function resolveTsconfig(packageDir, explicitTsconfig) {
  const candidates = explicitTsconfig
    ? [explicitTsconfig]
    : ["tsconfig.build.json", "tsconfig.json"];

  for (const candidate of candidates) {
    const resolved = path.isAbsolute(candidate)
      ? candidate
      : path.join(packageDir, candidate);

    if (fs.existsSync(resolved)) {
      return resolved;
    }
  }

  throw new Error(
    `Rollup 설정에 사용할 tsconfig를 찾을 수 없습니다. (검색 경로: ${candidates.join(", ")})`
  );
}

function createExternalMatcher(pkg, additionalExternals = []) {
  const dependencyFields = [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies"
  ];
  const declared = new Set(additionalExternals);

  for (const field of dependencyFields) {
    const deps = pkg[field];

    if (!deps) continue;

    for (const name of Object.keys(deps)) {
      declared.add(name);
    }
  }

  for (const builtin of DEFAULT_EXTERNAL) {
    declared.add(builtin);
  }

  return function isExternal(id) {
    if (id.startsWith("\0")) return false;
    if (id.startsWith("node:")) return true;

    for (const dep of declared) {
      if (id === dep || id.startsWith(`${dep}/`)) {
        return true;
      }
    }

    return false;
  };
}

export function createLibraryConfig(options = {}) {
  const packageDir = options.packageDir ?? process.cwd();
  const input = options.input ?? path.join(packageDir, "src/index.ts");
  const outputDir = options.outputDir ?? path.join(packageDir, "dist");
  const tsconfig = resolveTsconfig(packageDir, options.tsconfig);
  const pkg = loadPackageJson(packageDir);

  fs.rmSync(outputDir, { recursive: true, force: true });

  const external = createExternalMatcher(pkg, options.external);
  const exclude = [
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.stories.tsx",
    ...(options.exclude ?? [])
  ];

  return {
    input,
    external,
    output: {
      dir: outputDir,
      format: "esm",
      preserveModules: true,
      sourcemap: true,
      exports: "named"
    },
    plugins: [
      nodeResolve({ extensions: DEFAULT_EXTENSIONS }),
      commonjs(),
      json(),
      typescript({
        tsconfig,
        useTsconfigDeclarationDir: true,
        clean: true,
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
            declarationMap: true,
            emitDeclarationOnly: false,
            declarationDir: outputDir,
            outDir: outputDir
          },
          exclude
        }
      })
    ],
    treeshake: {
      moduleSideEffects: false
    }
  };
}
