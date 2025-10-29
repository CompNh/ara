#!/usr/bin/env node
import fs from "node:fs";
import process from "node:process";

const args = process.argv.slice(2);

if (args.includes("-v") || args.includes("--version")) {
  console.log("0.0.0-stub");
  process.exit(0);
}

if (args.length === 0) {
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  let data = "";
  process.stdin.on("data", (chunk) => {
    data += chunk;
  });
  process.stdin.on("end", () => {
    process.stdout.write(data);
  });
  return;
}

for (const path of args) {
  if (path.startsWith("-")) continue;
  try {
    const content = fs.readFileSync(path, "utf8");
    process.stdout.write(content);
  } catch (error) {
    console.error(`prettier stub: failed to read ${path}: ${error.message}`);
    process.exitCode = 1;
  }
}
