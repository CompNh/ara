/**
 * @ara/theme - tsup config
 * - CSS 변수/테마 유틸 중심. DOM 주입 유틸은 sideEffects 예외(4-7에서 처리)
 * - 외부 의존성 없음
 * - SSR 시 테마 마운트 유틸 사용 시점 주의(가이드 별도)
 */
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true,
  format: ['esm', 'cjs'],
  target: 'es2019',
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.mjs' };
  },
});
