// [NEW] 환경 스모크: jsdom/런타임 기동 확인용 (유지/확인만)
// - 무엇: document/window 존재 확인
// - 이유: Vitest 환경이 jsdom으로 기동되는지 증명
import { describe, it, expect } from 'vitest';

describe('env: jsdom', () => {
  it('document & window are available', () => {
    expect(typeof document.createElement).toBe('function');
    expect(typeof window).toBe('object');
  });
});
