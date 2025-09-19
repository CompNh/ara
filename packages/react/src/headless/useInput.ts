import * as React from 'react';

/** 제어/비제어 동시 지원 훅 */
function useControllable<T>(params: { value?: T; defaultValue?: T }) {
  const { value, defaultValue } = params;
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState<T | undefined>(defaultValue);
  const current = (isControlled ? value : uncontrolled) as T;

  const set = React.useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next);
    },
    [isControlled],
  );

  return [current, set, isControlled] as const;
}

export type UseInputOptions = {
  id?: string;
  /** 값(제어 컴포넌트) */
  value?: string;
  /** 초기값(비제어) */
  defaultValue?: string;
  onChange?: (ev: React.ChangeEvent<HTMLInputElement>) => void;

  name?: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;

  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /** 에러 상태 강제 */
  invalid?: boolean;

  /** a11y 텍스트 제공 여부(유무만 알면 됨) */
  hasLabel?: boolean;
  hasHint?: boolean;
  hasError?: boolean;
};

/** 반환 객체: props getter + 파생 상태/ID */
export type UseInputReturn = {
  /** 생성된/전달된 input id */
  inputId: string;
  labelId?: string;
  hintId?: string;
  errorId?: string;

  /** 파생 상태 */
  isInvalid: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;

  /** 현재 값 */
  value: string;

  /** 네이티브 엘리먼트에 바로 넣을 props 생성기 */
  getInputProps: (
    props?: React.InputHTMLAttributes<HTMLInputElement>,
  ) => React.InputHTMLAttributes<HTMLInputElement>;
  getLabelProps: (
    props?: React.LabelHTMLAttributes<HTMLLabelElement>,
  ) => React.LabelHTMLAttributes<HTMLLabelElement>;
  getHintProps: (
    props?: React.HTMLAttributes<HTMLParagraphElement>,
  ) => React.HTMLAttributes<HTMLParagraphElement>;
  getErrorProps: (
    props?: React.HTMLAttributes<HTMLParagraphElement>,
  ) => React.HTMLAttributes<HTMLParagraphElement>;
};

export function useInput(options: UseInputOptions = {}): UseInputReturn {
  const {
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

    hasLabel,
    hasHint,
    hasError,
  } = options;

  // React 18: SSR-safe useId. 외부 id가 있으면 우선 사용.
  const reactId = React.useId();
  const inputId = id ?? `ara-input-${reactId}`;

  // 관련 요소 id (존재할 때만 할당)
  const labelId = hasLabel ? `${inputId}-label` : undefined;
  const hintId = hasHint ? `${inputId}-hint` : undefined;
  const errorId = hasError ? `${inputId}-error` : undefined;

  const [current, setCurrent] = useControllable<string>({
    value,
    defaultValue,
  });

  const isInvalid = Boolean(invalid ?? hasError);
  const isDisabled = Boolean(disabled);
  const isReadOnly = Boolean(readOnly);
  const isRequired = Boolean(required);

  // describedby 구성: hint + error 순서
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const getInputProps: UseInputReturn['getInputProps'] = (props) => {
    const p = props ?? {};
    return {
      id: inputId,
      name,
      type,
      placeholder,
      disabled: isDisabled || undefined,
      readOnly: isReadOnly || undefined,
      required: isRequired || undefined,
      'aria-invalid': isInvalid || undefined,
      // invalid일 때만 errormessage 연결(명세 준수)
      'aria-errormessage': isInvalid && errorId ? errorId : undefined,
      'aria-required': isRequired || undefined,
      'aria-describedby': describedBy,
      value: current,
      onChange: (ev: React.ChangeEvent<HTMLInputElement>) => {
        setCurrent(ev.target.value); // 상태만 갱신
        onChange?.(ev); // 옵션으로 받은 외부 핸들러 호출
        p.onChange?.(ev); // 추가로 전달된 핸들러도 호출
      },
      ...p,
    };
  };

  const getLabelProps: UseInputReturn['getLabelProps'] = (props) => {
    const p = props ?? {};
    return {
      id: labelId,
      htmlFor: inputId,
      ...p,
    };
  };

  const getHintProps: UseInputReturn['getHintProps'] = (props) => {
    const p = props ?? {};
    return {
      id: hintId,
      // 힌트는 보통 라이브영역이 아님
      ...p,
    };
  };

  const getErrorProps: UseInputReturn['getErrorProps'] = (props) => {
    const p = props ?? {};
    return {
      id: errorId,
      role: 'alert', // 오류 메시지는 즉시 공지
      'aria-live': 'assertive',
      ...p,
    };
  };

  return {
    inputId,
    labelId,
    hintId,
    errorId,
    isInvalid,
    isDisabled,
    isReadOnly,
    isRequired,
    value: current,
    getInputProps,
    getLabelProps,
    getHintProps,
    getErrorProps,
  };
}
