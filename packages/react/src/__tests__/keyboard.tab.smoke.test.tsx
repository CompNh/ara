import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, userEvent } from '../testing/test-utils';

describe('keyboard: tab navigation', () => {
  it('moves focus with Tab', async () => {
    const u = userEvent.setup();
    render(
      <>
        <button>first</button>
        <button>second</button>
      </>,
    );

    // 첫 Tab -> first
    await u.tab();
    expect(screen.getByText('first')).toHaveFocus();

    // 두 번째 Tab -> second
    await u.tab();
    expect(screen.getByText('second')).toHaveFocus();
  });
});
