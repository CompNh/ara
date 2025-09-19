import * as React from 'react';
import { useInput, type UseInputOptions } from '../../headless/useInput';

/** Input 컴포넌트 공개 Props */
export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'value' | 'defaultValue' | 'onChange'
> &
  Pick<
    UseInputOptions,
    | 'id'
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'name'
    | 'type'
    | 'placeholder'
    | 'disabled'
    | 'readOnly'
    | 'required'
    | 'invalid'
  > & {
    /** 내부 라벨 텍스트 (옵션) */
    label?: string;
    /** 라벨을 시각적으로 숨기고 스크린리더에만 노출 */
    labelHidden?: boolean;
    /** 보조 설명 (힌트) */
    hint?: string;
    /** 에러 메시지(존재 시 aria-invalid 강제) */
    error?: string;
    /** 시각적 사이즈 토큰 */
    size?: 'sm' | 'md' | 'lg';
    /** 외부 스타일 확장 */
    className?: string;
  };

/**
 * 접근성 원칙:
 * - 라벨/힌트/에러를 모두 ID로 연결(aria-describedby)
 * - 에러 존재 시 role="alert"로 즉시 공지
 * - 네이티브 <input> 사용으로 키보드/IMEs 호환
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id,
    value,
    defaultValue,
    onChange,

    name,
    type = 'text',
    placeholder,

    disabled,
    readOnly,
    required,
    invalid,

    label,
    labelHidden = false,
    hint,
    error,
    size = 'md',
    className,
    ...rest
  },
  ref,
) {
  // headless 훅: A11y/ID/값 관리
  const api = useInput({
    id,
    value,
    defaultValue,
    onChange,
    name,
    type,
    placeholder,
    disabled,
    readOnly,
    required,
    invalid,
    hasLabel: Boolean(label),
    hasHint: Boolean(hint),
    hasError: Boolean(error),
  });

  return (
    <div
      data-ara-input=""
      data-size={size}
      data-invalid={api.isInvalid ? '' : undefined}
      data-disabled={api.isDisabled ? '' : undefined}
      data-readonly={api.isReadOnly ? '' : undefined}
      className={className}
    >
      {/* 라벨 (옵션) */}
      {label ? (
        <label
          {...api.getLabelProps({
            // 시각적으로만 숨김(스크린리더는 읽음). 유틸 클래스가 없다면 아래 인라인 스타일 사용.
            className: labelHidden ? 'sr-only' : undefined,
            style: labelHidden
              ? {
                  position: 'absolute',
                  width: 1,
                  height: 1,
                  padding: 0,
                  margin: -1,
                  overflow: 'hidden',
                  clip: 'rect(0,0,0,0)',
                  whiteSpace: 'nowrap',
                  border: 0,
                }
              : undefined,
          })}
        >
          {label}
        </label>
      ) : null}

      {/* 실제 입력 필드 */}
      <input ref={ref} {...api.getInputProps(rest)} />

      {/* 힌트/에러 영역: 존재할 때만 렌더 */}
      {hint ? <p {...api.getHintProps()}>{hint}</p> : null}
      {error ? <p {...api.getErrorProps()}>{error}</p> : null}
    </div>
  );
});

export default Input;
