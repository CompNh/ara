/**
 * @ara/react-headless - tsup config
 * - 로직/상태만 제공(스타일 없음)
 * - React는 peer로 외부화
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
  external: ['react'],
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.mjs' };
  },
});
