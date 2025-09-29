// Do not edit ??tooling script for @ara/tokens
// Converts dist/tokens/tokens.json -> dist/index.ts (TS consumers)
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../dist/tokens/tokens.json');
const raw = readFileSync(src, 'utf-8');

const out = `// Do not edit ??generated from dist/tokens/tokens.json
// Generated at ${new Date().toISOString()}
export const tokensJSON: any = ${raw};
export type Tokens = typeof tokensJSON;
`;
writeFileSync(path.resolve(__dirname, '../dist/index.ts'), out, 'utf-8');
console.log('Wrote: dist/index.ts');
