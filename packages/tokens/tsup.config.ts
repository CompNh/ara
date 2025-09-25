import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true, // 타입 선언 파일 생성
  sourcemap: true, // 소스맵 생성
  clean: true, // 빌드 전 dist 비움
  target: 'es2022',
  outDir: 'dist',
  treeshake: true,
  skipNodeModulesBundle: true,
  minify: false,
});
