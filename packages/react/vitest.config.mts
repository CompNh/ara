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
      thresholds: {                      // ★ 지금은 "수집/통과"에 집중 (실패 안 함)
        lines: 0,
        branches: 0,
        functions: 0,
        statements: 0,
      },      
      exclude: [
        '**/dist/**',        
        'dist/**',
        '**/*.d.ts',
        '**/__tests__/**',
        '**/*.test.*',
        '**/*.spec.*',
        // 필요시 예외 추가: 스토리, 스냅샷 등
        '**/*.stories.*',        
      ],
    },
  },
});
