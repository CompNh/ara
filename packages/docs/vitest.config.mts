// Vitest preflight config for @ara/docs (Step 6-0.2)
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    port: 5173    
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
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

