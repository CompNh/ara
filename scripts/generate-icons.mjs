#!/usr/bin/env node
import fs from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { XMLParser } from "fast-xml-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_INPUT_DIR = path.join(ROOT_DIR, "packages/icons/svgs");
const DEFAULT_OUTPUT_DIR = path.join(ROOT_DIR, "packages/icons/src/icons");
const INDEX_PATH = path.join(ROOT_DIR, "packages/icons/src/index.ts");

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  allowBooleanAttributes: true
});

const ATTRIBUTE_NAME_MAP = new Map([
  ["class", "className"],
  ["stroke-width", "strokeWidth"],
  ["stroke-linecap", "strokeLinecap"],
  ["stroke-linejoin", "strokeLinejoin"],
  ["fill-rule", "fillRule"],
  ["clip-rule", "clipRule"]
]);

const INDENT = "  ";

function parseArgs(argv) {
  const args = { input: DEFAULT_INPUT_DIR, output: DEFAULT_OUTPUT_DIR, diff: false };

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];

    if (current === "--input" && argv[i + 1]) {
      args.input = path.resolve(argv[i + 1]);
      i += 1;
    } else if (current === "--output" && argv[i + 1]) {
      args.output = path.resolve(argv[i + 1]);
      i += 1;
    } else if (current === "--diff") {
      args.diff = true;
    }
  }

  return args;
}

function toPascalCase(value) {
  return value
    .replace(/\.svg$/i, "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
}

function toJsxAttributeName(name) {
  const mapped = ATTRIBUTE_NAME_MAP.get(name);
  if (mapped) return mapped;

  return name
    .replace(/^@_/, "")
    .replace(/[:]/g, "")
    .replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function escapeAttributeValue(value) {
  return String(value).replace(/"/g, "&quot;");
}

function extractAttributes(node) {
  const attributes = {};

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("@_")) {
      attributes[key.slice(2)] = value;
    }
  }

  return attributes;
}

function formatAttributes(attributes, indentLevel) {
  const entries = Object.entries(attributes)
    .filter(([name]) => !name.startsWith("xmlns"))
    .map(([name, value]) => `${INDENT.repeat(indentLevel)}${toJsxAttributeName(name)}="${escapeAttributeValue(value)}"`);

  if (entries.length === 0) return "";

  return `\n${entries.join("\n")}`;
}

function collectChildren(node) {
  const children = [];

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("@_")) continue;
    if (key === "#text") {
      const text = typeof value === "string" ? value.trim() : "";
      if (text) children.push({ type: "text", value: text });
      continue;
    }

    if (Array.isArray(value)) {
      for (const child of value) {
        children.push({ type: "element", tag: key, node: child });
      }
      continue;
    }

    if (value !== undefined) {
      children.push({ type: "element", tag: key, node: value });
    }
  }

  return children;
}

function renderElement(tag, node, indentLevel) {
  const indent = INDENT.repeat(indentLevel);
  const attributes = formatAttributes(extractAttributes(node), indentLevel + 1);
  const children = collectChildren(node);

  if (children.length === 0) {
    return `${indent}<${tag}${attributes} />`;
  }

  const renderedChildren = children
    .map((child) => {
      if (child.type === "text") {
        return `${INDENT.repeat(indentLevel + 1)}{` + `"${child.value}"` + `}`;
      }

      return renderElement(child.tag, child.node, indentLevel + 1);
    })
    .join("\n");

  return `${indent}<${tag}${attributes}>\n${renderedChildren}\n${indent}</${tag}>`;
}

function buildIconComponent(name, svgNode) {
  const attributes = extractAttributes(svgNode);
  const children = collectChildren(svgNode);
  const renderedChildren = children.map((child) => {
    if (child.type === "text") {
      return `${INDENT.repeat(2)}{` + `"${child.value}"` + `}`;
    }

    return renderElement(child.tag, child.node, 2);
  });

  const attributeBlock = formatAttributes(attributes, 2);
  const childBlock = renderedChildren.length > 0 ? `\n${renderedChildren.join("\n")}\n` : "\n";
  const normalizedChildBlock = childBlock.trim() ? childBlock.trimEnd() : "";

  return [
    'import type { IconProps } from "../types.js";',
    "",
    `export const ${name} = ({ title, ...props }: IconProps) => (`,
    "  <svg",
    `    {...props}${attributeBlock}`,
    "    aria-hidden={title ? undefined : true}",
    "    role={title ? \"img\" : undefined}",
    "  >",
    "    {title ? <title>{title}</title> : null}",
    normalizedChildBlock,
    "  </svg>",
    ");"
  ]
    .filter(Boolean)
    .join("\n")
    .concat("\n");
}

function buildIndexFile(definitions) {
  const sorted = [...definitions].sort((a, b) => a.name.localeCompare(b.name));
  const imports = sorted
    .map((icon) => `import { ${icon.name} } from "./icons/${icon.fileName}.js";`)
    .join("\n");

  const iconEntries = sorted.map((icon) => icon.name).join(", ");
  const iconObjectEntries = sorted.map((icon) => `${INDENT}${icon.name}`).join(",\n");

  return [
    'export type { IconProps } from "./types.js";',
    imports,
    "",
    `export { ${iconEntries} };`,
    "",
    "export const icons = {",
    iconObjectEntries,
    "} as const;",
    "",
    "export type IconName = keyof typeof icons;",
    ""
  ]
    .filter(Boolean)
    .join("\n")
    .concat("\n");
}

async function showDiff(targetPath, nextContent) {
  const diff = spawnSync("diff", ["-u", targetPath, "-"], {
    input: nextContent,
    encoding: "utf-8"
  });

  if (diff.status === 0) {
    console.log(`[UNCHANGED] ${path.relative(ROOT_DIR, targetPath)}`);
    return;
  }

  if (diff.status === 1 && diff.stdout) {
    console.log(diff.stdout);
    return;
  }

  console.error(diff.stderr || diff.stdout);
}

async function writeFile(targetPath, content, diffMode) {
  if (diffMode) {
    try {
      await fs.access(targetPath);
      await showDiff(targetPath, content);
      return;
    } catch {
      console.log(`[NEW] ${path.relative(ROOT_DIR, targetPath)}`);
      console.log(content);
      return;
    }
  }

  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, content, "utf-8");
  console.log(`[UPDATED] ${path.relative(ROOT_DIR, targetPath)}`);
}

async function generateIconFromFile(filePath) {
  const content = await fs.readFile(filePath, "utf-8");
  const parsed = parser.parse(content);
  const svgNode = parsed?.svg;

  if (!svgNode) {
    throw new Error(`SVG 루트 노드를 찾을 수 없습니다: ${filePath}`);
  }

  const baseName = path.basename(filePath, path.extname(filePath));
  const componentName = toPascalCase(baseName);
  const componentSource = buildIconComponent(componentName, svgNode);

  return { name: componentName, fileName: baseName, source: componentSource };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const files = (await fs.readdir(args.input)).filter((file) => file.endsWith(".svg"));

  if (files.length === 0) {
    console.warn(`SVG 파일을 찾을 수 없습니다: ${args.input}`);
    return;
  }

  const definitions = [];

  for (const file of files) {
    const fullPath = path.join(args.input, file);
    const definition = await generateIconFromFile(fullPath);
    definitions.push(definition);

    const outputPath = path.join(args.output, `${definition.fileName}.tsx`);
    await writeFile(outputPath, definition.source, args.diff);
  }

  const indexSource = buildIndexFile(definitions);
  await writeFile(INDEX_PATH, indexSource, args.diff);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
