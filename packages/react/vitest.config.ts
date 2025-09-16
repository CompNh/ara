// Vitest preflight config for @ara/react (Step 6-0.2)
// - jsdom 환경 + setup 파일 연결
// - 커버리지 리포터(v8)는 6-1에서 의존성 설치 후 동작
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      exclude: ['**/dist/**', '**/*.d.ts'],
    },
  },
});
