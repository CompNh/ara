import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../../testing/test-utils';
import { Input } from './Input';

describe('<Input />', () => {
  it('라벨과 입력이 for/htmlFor로 연결된다', () => {
    render(<Input id="email" label="이메일" />);
    const label = screen.getByText('이메일');
    const input = screen.getByRole('textbox');
    expect(label).toHaveAttribute('for', input.getAttribute('id'));
  });

  it('힌트/에러가 aria-describedby로 연결된다(둘 다 있을 때 공백 구분)', () => {
    render(<Input label="이름" hint="실명 입력" error="필수 입력입니다" />);
    const input = screen.getByLabelText('이름');
    const describedby = input.getAttribute('aria-describedby')!;
    const ids = describedby.split(' ');
    // 힌트와 에러 각각의 요소가 존재하고, 두 ID가 모두 포함되어야 함
    const hint = screen.getByText('실명 입력');
    const error = screen.getByText('필수 입력입니다');
    expect(ids).toContain(hint.getAttribute('id'));
    expect(ids).toContain(error.getAttribute('id'));
  });

  it('에러가 있으면 aria-invalid="true" 이고, 에러는 role="alert"로 즉시 공지된다', () => {
    render(<Input label="암호" error="8자 이상 입력하세요" />);
    const input = screen.getByLabelText('암호');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const error = screen.getByText('8자 이상 입력하세요');
    expect(error).toHaveAttribute('role', 'alert');
  });

  it('제어 컴포넌트에서 onChange가 호출되고 값이 반영된다', async () => {
    const user = userEvent.setup();
    const handle = vi.fn();
    function Controlled() {
      const [v, setV] = React.useState('');
      return (
        <Input
          label="닉네임"
          value={v}
          onChange={(e) => {
            handle(e.currentTarget.value);
            setV(e.currentTarget.value);
          }}
        />
      );
    }
    render(<Controlled />);
    const input = screen.getByLabelText('닉네임');
    await user.type(input, 'ara');
    expect(handle).toHaveBeenCalled();
    expect((input as HTMLInputElement).value).toBe('ara');
  });

  it('비제어(defaultValue)도 정상 동작한다', async () => {
    const user = userEvent.setup();
    render(<Input label="검색어" defaultValue="a" />);
    const input = screen.getByLabelText('검색어') as HTMLInputElement;
    expect(input.value).toBe('a');
    await user.type(input, 'ra');
    expect(input.value).toBe('ara');
  });

  it('disabled/readonly/required 상태가 속성 및 aria-*로 반영된다', () => {
    render(<Input label="필드" disabled readOnly required />);
    const input = screen.getByLabelText('필드');
    expect(input).toHaveAttribute('disabled');
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('aria-required', 'true');
  });
});
