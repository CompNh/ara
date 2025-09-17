// [NEW] 매처 스모크: @testing-library/jest-dom 로드 확인 (유지/확인만)
// - 무엇: toBeInTheDocument 매처 동작
// - 이유: vitest.setup.ts에서 매처 로드가 실제로 반영되는지 증명
import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../testing/test-utils';

describe('jest-dom matchers', () => {
  it('toBeInTheDocument works', () => {
    render(<div data-testid="probe" />);
    expect(screen.getByTestId('probe')).toBeInTheDocument();
  });
});
