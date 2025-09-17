// [NEW] userEvent 스모크: 클릭/상태 업데이트 경로 확인 (유지/확인만)
// - 무엇: 버튼 클릭으로 상태 증가
// - 이유: userEvent, React 렌더, 커스텀 render(wrapper) 경로 검증
import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, userEvent } from '../testing/test-utils';

function Counter() {
  const [n, setN] = React.useState(0);
  return (
    <button onClick={() => setN((v) => v + 1)} aria-label="inc">
      count: {n}
    </button>
  );
}

describe('userEvent + state', () => {
  it('increments on click', async () => {
    const u = userEvent.setup();
    render(<Counter />);
    expect(screen.getByRole('button', { name: 'inc' })).toHaveTextContent('count: 0');
    await u.click(screen.getByRole('button', { name: 'inc' }));
    expect(screen.getByRole('button', { name: 'inc' })).toHaveTextContent('count: 1');
  });
});
