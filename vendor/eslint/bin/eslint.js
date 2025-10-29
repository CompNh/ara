#!/usr/bin/env node
import process from "node:process";

const args = process.argv.slice(2);

if (args.includes("-v") || args.includes("--version")) {
  console.log("0.0.0-stub");
  process.exit(0);
}

if (args.includes("-h") || args.includes("--help")) {
  console.log(`eslint (stub)\n\nUsage: eslint [options] [file|dir]`);
  process.exit(0);
}

console.log("ESLint stub: linting is skipped in the offline environment.");
process.exit(0);
