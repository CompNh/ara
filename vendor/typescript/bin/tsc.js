#!/usr/bin/env node
import process from "node:process";

if (process.argv.includes("-v") || process.argv.includes("--version")) {
  console.log("0.0.0-stub");
  process.exit(0);
}

console.log("TypeScript stub: compilation skipped.");
process.exit(0);
