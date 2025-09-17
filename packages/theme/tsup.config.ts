/**
 * @ara/theme - tsup config
 * - CSS 변수/테마 유틸 중심. DOM 주입 유틸은 sideEffects 예외(4-7에서 처리)
 * - 외부 의존성 없음
 * - SSR 시 테마 마운트 유틸 사용 시점 주의(가이드 별도)
 */
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    // 선택: 실제로 존재할 때만 유지하세요(없으면 제거)
    styles: 'src/styles.css',
  },
  dts: true,
  format: ['esm', 'cjs'],
  outDir: 'dist',
  target: 'es2021',
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  // CSS를 파일로 복사(번들 X)
  loader: { '.css': 'copy' },
  outExtension: ({ format }) => ({ js: format === 'cjs' ? '.cjs' : '.mjs' }),
});
