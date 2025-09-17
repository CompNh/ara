// 목적: @ara/tokens 모듈이 정상 로드되고 최소 1개 이상의 export가 존재함을 보장
// 환경 의존 없음(Node/jsdom 모두 OK)
import { describe, it, expect } from 'vitest';

describe('@ara/tokens exports', () => {
  it('module loads and has at least one export', async () => {
    const mod = await import('..'); // packages/tokens/src/index.ts 기준
    expect(mod).toBeTruthy();
    expect(typeof mod).toBe('object');
    expect(Object.keys(mod).length).toBeGreaterThan(0); // default 만 있어도 "default" 키로 잡힘
  });
});
