/**
 * @ara/tokens - tsup config
 * - 공통 빌드 규약: ESM/CJS + d.ts + treeshake + sourcemap
 * - 외부 의존성 없음
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
