import * as React from 'react';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * 시맨틱 버튼(기본). 필요 시 variant/scheme 확장.
   */
  variant?: 'primary' | 'ghost';
  loading?: boolean;
};

/**
 * 접근성 기본 보장:
 * - 네이티브 <button> 사용(Enter/Space 키 지원)
 * - disabled/aria-busy 동기화
 * - 포커스 링은 소비자 측 스타일로 제어 (className 전달)
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading = false, disabled, className, children, ...rest }, ref) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        type="button"
        data-ara-button=""
        data-variant={variant}
        aria-busy={loading || undefined}
        disabled={isDisabled}
        className={className}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
