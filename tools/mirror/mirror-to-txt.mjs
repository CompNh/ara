// tools/mirror/mirror-to-txt.mjs
// 원본 트리를 읽어 mirror/ 아래에 동일 구조로 *.txt 복제
import { promises as fs } from 'node:fs';
import path from 'node:path';

const DEST_ROOT = 'mirror';

// 텍스트 확장자 화이트리스트 (이외에도 확장자 없는 파일/도트파일은 별도 판별로 포함)
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
  '.txt',
  '.env',
  '.sh',
  '.bash',
  '.tsconfig',
  '.eslintrc',
  '.prettierrc',
  '.gitignore',
  '.gitattributes',
  '.editorconfig',
  '.dockerfile',
  'commit-msg',
  'pre-commit',
  'pre-push',
]);

// 제외 디렉터리 (요청에 따라 .husky / tools / test-results 는 포함되도록 제외 목록에서 뺌)
const EXCLUDE_DIR = new Set([
  'node_modules',
  '.git',
  '.turbo',
  'dist',
  'build',
  '.next',
  '.playwright',
  'playwright-report',
]);

// 확장자 없거나 도트파일을 포함할 때의 최대 크기(안전장치)
const MAX_TXT_BYTES = 2 * 1024 * 1024; // 2MB

function isProbablyText(buf) {
  // 간단한 휴리스틱: 널바이트가 있으면 바이너리로 간주, 제어문자 비율이 높으면 제외
  const len = Math.min(buf.length, 2048);
  if (len === 0) return true;
  let control = 0;
  for (let i = 0; i < len; i++) {
    const b = buf[i];
    if (b === 0) return false; // null byte -> binary
    // 허용 제어: tab(9), LF(10), FF(12), CR(13)
    if (b < 32 && ![9, 10, 12, 13].includes(b)) control++;
  }
  return control / len < 0.02;
}

async function rmrf(p) {
  try {
    await fs.rm(p, { recursive: true, force: true });
  } catch (e) {
    if (!e || e.code !== 'ENOENT') throw e;
  }
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}
function isExcluded(fullPath, dirent) {
  // 현재 항목의 프로젝트 루트 기준 상대경로 (슬래시 정규화)
  const rel = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');

  // 디렉터리 이름 자체로 제외
  if (dirent.isDirectory() && EXCLUDE_DIR.has(dirent.name)) return true;

  // ⬇️ 정확히 `.husky/_` 폴더(및 그 하위)만 제외
  if (rel === '.husky/_' || rel.startsWith('.husky/_/')) return true;

  return false;
}

async function walk(dir, cb) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (isExcluded(full, e)) continue;
    if (e.isDirectory()) await walk(full, cb);
    else if (e.isFile()) await cb(full);
  }
}

function toOutPath(abs) {
  const rel = path.relative(process.cwd(), abs).replace(/\\/g, '/');
  const parsed = path.parse(rel);
  const outDir = path.join(DEST_ROOT, parsed.dir);
  const outName = `${parsed.base}.txt`; // ex) Button.tsx -> Button.tsx.txt
  return {
    outDir,
    outFull: path.join(outDir, outName),
    ext: (parsed.ext || '').toLowerCase(),
    base: parsed.base,
  };
}

async function main() {
  await rmrf(DEST_ROOT);
  await ensureDir(DEST_ROOT);

  let count = 0;

  await walk(process.cwd(), async (file) => {
    const { outDir, outFull, ext, base } = toOutPath(file);

    // 1) 확장자 화이트리스트면 바로 포함
    if (INCLUDE_EXT.has(ext)) {
      const text = await fs.readFile(file, 'utf8');
      await ensureDir(outDir);
      await fs.writeFile(outFull, text, 'utf8');
      count++;
      return;
    }

    // 2) 확장자 없음 또는 도트파일(.editorconfig, .gitattributes 등)
    const isDotfile = base.startsWith('.');
    if (ext === '' || isDotfile) {
      const buf = await fs.readFile(file);
      if (buf.length <= MAX_TXT_BYTES && isProbablyText(buf)) {
        await ensureDir(outDir);
        await fs.writeFile(outFull, buf.toString('utf8'), 'utf8');
        count++;
      }
      return;
    }

    // 3) 그 외 확장자는 스킵 (바이너리 가능성 높음)
  });

  console.log(`Mirrored ${count} file(s) -> ${DEST_ROOT}/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
