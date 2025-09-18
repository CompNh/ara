// tools/mirror/mirror-to-txt.mjs
// 원본 트리를 읽어 mirror/ 아래에 동일 구조로 *.txt 복제
import { promises as fs } from 'node:fs';
import path from 'node:path';

const DEST_ROOT = 'mirror';
const INCLUDE_EXT = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.css',
  '.scss',
  '.html',
  '.yml',
  '.yaml',
]);
const EXCLUDE_DIR = new Set([
  'node_modules',
  '.git',
  '.turbo',
  'dist',
  'build',
  '.next',
  '.playwright',
  'playwright-report',
  'test-results',
  '.husky',
]);

async function rmrf(p) {
  try {
    await fs.rm(p, { recursive: true, force: true });
  } catch (e) {
    // 경로가 없으면(ENOENT) 무시, 그 외는 재throw
    if (!e || e.code !== 'ENOENT') throw e;
  }
}
async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function walk(dir, cb) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (EXCLUDE_DIR.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, cb);
    else if (e.isFile()) await cb(full);
  }
}

function toOutPath(abs) {
  const rel = path.relative(process.cwd(), abs).replace(/\\/g, '/');
  const parsed = path.parse(rel);
  const outDir = path.join(DEST_ROOT, parsed.dir);
  const outName = `${parsed.base}.txt`; // ex) Button.tsx -> Button.tsx.txt
  return { outDir, outFull: path.join(outDir, outName), ext: parsed.ext.toLowerCase() };
}

async function main() {
  await rmrf(DEST_ROOT);
  await ensureDir(DEST_ROOT);

  let count = 0;
  await walk(process.cwd(), async (file) => {
    const { outDir, outFull, ext } = toOutPath(file);
    if (!INCLUDE_EXT.has(ext)) return; // 텍스트 확장자만
    const text = await fs.readFile(file, 'utf8');
    await ensureDir(outDir);
    await fs.writeFile(outFull, text, 'utf8');
    count++;
  });

  console.log(`Mirrored ${count} file(s) -> ${DEST_ROOT}/`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
