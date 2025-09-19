import { render, screen } from '../../testing/test-utils';
import * as React from 'react';
import { Input } from './Input';
import { it, expect } from 'vitest';

it('error가 있으면 aria-invalid/aria-errormessage가 연결된다', () => {
  render(<Input label="암호" error="8자 이상 입력하세요" />);
  const input = screen.getByLabelText('암호');
  const err = screen.getByText('8자 이상 입력하세요');
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(input).toHaveAttribute('aria-errormessage', err.id);
});
