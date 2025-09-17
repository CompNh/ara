// 목적: @ara/docs 모듈이 에러 없이 로드됨을 보장
// (문서 패키지는 런타임 export가 없을 수 있어 '키 > 0' 검사는 생략)
import { describe, it, expect } from 'vitest';

describe('@ara/docs exports', () => {
  it('module loads (no runtime exports required yet)', async () => {
    const mod = await import('..'); // packages/docs/src/index.ts 기준
    expect(mod).toBeTruthy();
    expect(typeof mod).toBe('object');
    // NOTE: export 키 개수 검사는 생략 (0이어도 OK)
  });
});
