#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const EXPECTED_SCOPE = '@ara/';
const LIB_EXPECTED_ACCESS = 'public';
const MINIMUM_NODE = /^\s*(>=|\^)\s*22(\.|$)/;

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readPackageManifest(manifestPath) {
  const raw = await fs.readFile(manifestPath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`package.json 파싱 실패 (${manifestPath}): ${error.message}`);
  }
}

async function listDirectSubdirectories(targetDir) {
  try {
    const entries = await fs.readdir(targetDir, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).map((entry) => path.join(targetDir, entry.name));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

function hasRepositoryField(manifest) {
  if (!manifest.repository) {
    return false;
  }
  if (typeof manifest.repository === 'string') {
    return manifest.repository.trim().length > 0;
  }
  if (typeof manifest.repository === 'object') {
    return typeof manifest.repository.url === 'string' && manifest.repository.url.trim().length > 0;
  }
  return false;
}

function collectManifestIssues({ manifest, relativeDir, kind }) {
  const issues = [];

  if (!manifest.name || typeof manifest.name !== 'string') {
    issues.push('name 필드가 비어 있습니다.');
  }

  if (!manifest.license || typeof manifest.license !== 'string' || manifest.license.trim().length === 0) {
    issues.push('license 필드를 채워야 합니다.');
  }

  const enginesNode = manifest.engines?.node;
  if (!enginesNode || !MINIMUM_NODE.test(enginesNode)) {
    issues.push('engines.node 필드는 ">=22" 이상을 명시해야 합니다.');
  }

  if (!hasRepositoryField(manifest)) {
    issues.push('repository 필드를 설정해야 합니다.');
  }

  if (kind === 'package') {
    if (typeof manifest.name === 'string' && !manifest.name.startsWith(EXPECTED_SCOPE)) {
      issues.push(`패키지 이름은 ${EXPECTED_SCOPE} 스코프를 사용해야 합니다.`);
    }
    if (manifest.private === true) {
      issues.push('packages/* 경로의 패키지는 private: true를 사용할 수 없습니다.');
    }
    const access = manifest.publishConfig?.access;
    if (access !== LIB_EXPECTED_ACCESS) {
      issues.push(`publishConfig.access 값이 "${LIB_EXPECTED_ACCESS}" 여야 합니다.`);
    }
  }

  if (kind === 'app') {
    if (manifest.private !== true) {
      issues.push('apps/* 경로의 패키지는 private: true를 설정해야 합니다.');
    }
    if (manifest.publishConfig?.access) {
      issues.push('apps/* 경로의 패키지는 publishConfig.access를 설정하지 않습니다.');
    }
  }

  return issues.length > 0 ? { relativeDir, issues } : null;
}

async function gatherManifests(kind, relativeRoot) {
  const rootDir = path.join(repoRoot, relativeRoot);
  const directories = await listDirectSubdirectories(rootDir);
  const manifests = [];

  for (const dir of directories) {
    const manifestPath = path.join(dir, 'package.json');
    if (!(await pathExists(manifestPath))) {
      continue;
    }

    const manifest = await readPackageManifest(manifestPath);
    const relativeDir = path.relative(repoRoot, dir);
    manifests.push({ manifest, relativeDir, kind });
  }

  return manifests;
}

async function main() {
  const manifests = [
    ...(await gatherManifests('package', 'packages')),
    ...(await gatherManifests('app', 'apps')),
  ];

  if (manifests.length === 0) {
    console.log('확인할 패키지 매니페스트가 없습니다. (packages/*, apps/* 경로가 비어 있음)');
    return;
  }

  const problems = manifests
    .map(collectManifestIssues)
    .filter(Boolean);

  if (problems.length > 0) {
    console.error('패키지 거버넌스 규칙을 위반한 매니페스트가 발견되었습니다:');
    for (const problem of problems) {
      console.error(`\n- ${problem.relativeDir}`);
      for (const issue of problem.issues) {
        console.error(`  • ${issue}`);
      }
    }
    process.exitCode = 1;
    return;
  }

  for (const manifest of manifests) {
    console.log(`✅ ${manifest.relativeDir} - 정책을 준수합니다.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
