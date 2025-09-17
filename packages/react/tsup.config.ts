/**
 * @ara/react - tsup config
 * - 스타일 포함 UI 컴포넌트 패키지
 * - react/react-dom은 peer로 외부화
 * - JSX 자동 변환(React 17+)
 */
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  sourcemap: true,
  outDir: 'dist',
  clean: true,
  minify: false,
  treeshake: true,
  splitting: false,
  format: ['esm', 'cjs'],
  target: 'es2021',
  external: ['react', 'react-dom'],
  esbuildOptions(opts) {
    opts.jsx = 'automatic';
  },
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.mjs' };
  },
});
