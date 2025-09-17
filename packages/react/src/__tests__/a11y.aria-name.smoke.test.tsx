import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../testing/test-utils';

describe('a11y: aria name', () => {
  it('button is queryable by accessible name', () => {
    render(<button aria-label="Save changes" />);
    const btn = screen.getByRole('button', { name: /save changes/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAccessibleName('Save changes');
  });
});
