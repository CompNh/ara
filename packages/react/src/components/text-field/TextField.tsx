import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FocusEventHandler,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type KeyboardEventHandler,
  type ReactNode,
  type Ref
} from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { useTextField, type TextFieldType } from "@ara/core";

type TextFieldSize = "sm" | "md" | "lg";

interface TextFieldOwnProps {
  readonly label?: ReactNode;
  readonly helperText?: ReactNode;
  readonly errorText?: ReactNode;
  readonly prefixIcon?: ReactNode;
  readonly suffixIcon?: ReactNode;
  readonly clearable?: boolean;
  readonly passwordToggle?: boolean;
  readonly size?: TextFieldSize;
  readonly onValueChange?: (value: string) => void;
  readonly onCommit?: (value: string) => void;
  readonly inputRef?: Ref<HTMLInputElement>;
}

type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type" | "value" | "defaultValue" | "onChange" | "children"
>;

export type TextFieldProps = TextFieldOwnProps &
  NativeInputProps &
  Pick<HTMLAttributes<HTMLDivElement>, "className" | "style"> & {
    readonly type?: TextFieldType;
    readonly value?: string;
    readonly defaultValue?: string;
    readonly onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  };

const supportsFocusVisible = (() => {
  if (typeof window === "undefined" || typeof window.CSS === "undefined") return false;
  if (typeof window.CSS.supports !== "function") return false;
  try {
    return window.CSS.supports("selector(:focus-visible)");
  } catch {
    return false;
  }
})();

function mergeClassNames(...values: Array<string | undefined | null | false>): string {
  return values.filter(Boolean).join(" ");
}

function normalizeSize(size: TextFieldSize | undefined): TextFieldSize {
  if (size === "sm" || size === "lg") return size;
  return "md";
}

function composeEventHandlers<Event>(
  ours: ((event: Event) => void) | undefined,
  theirs: ((event: Event) => void) | undefined
): (event: Event) => void {
  if (!ours && !theirs) return () => {};
  return (event: Event) => {
    ours?.(event);
    theirs?.(event);
  };
}

const SIZE_TOKENS: Record<TextFieldSize, {
  height: string;
  paddingX: string;
  paddingY: string;
  gap: string;
  fontSize: string;
  lineHeight: string;
  icon: string;
  clear: string;
  toggle: string;
}> = {
  sm: {
    height: "2.25rem",
    paddingX: "0.5rem",
    paddingY: "0.375rem",
    gap: "0.375rem",
    fontSize: "0.875rem",
    lineHeight: "1.4",
    icon: "1rem",
    clear: "1.25rem",
    toggle: "1.25rem"
  },
  md: {
    height: "2.75rem",
    paddingX: "0.75rem",
    paddingY: "0.5rem",
    gap: "0.5rem",
    fontSize: "1rem",
    lineHeight: "1.5",
    icon: "1.25rem",
    clear: "1.25rem",
    toggle: "1.25rem"
  },
  lg: {
    height: "3.25rem",
    paddingX: "1rem",
    paddingY: "0.75rem",
    gap: "0.625rem",
    fontSize: "1.125rem",
    lineHeight: "1.5",
    icon: "1.35rem",
    clear: "1.35rem",
    toggle: "1.35rem"
  }
};

export const TextField = forwardRef<HTMLDivElement, TextFieldProps>(function TextField(
  props,
  ref
) {
  const {
    label,
    helperText,
    errorText,
    prefixIcon,
    suffixIcon,
    clearable = false,
    passwordToggle = false,
    size: sizeProp,
    className,
    style,
    type: typeProp = "text",
    value,
    defaultValue,
    disabled = false,
    readOnly = false,
    required = false,
    onValueChange,
    onCommit,
    inputRef,
    autoComplete = "on",
    onChange: onChangeProp,
    onKeyDown: onKeyDownProp,
    onFocus: onFocusProp,
    onBlur: onBlurProp,
    ...restInputProps
  } = props;

  const size = normalizeSize(sizeProp);
  const valueRef = useRef(value ?? defaultValue ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [isFocusVisible, setFocusVisible] = useState(false);

  const resolvedType: TextFieldType =
    passwordToggle && typeProp === "password" && showPassword ? "text" : typeProp;

  const {
    inputProps,
    labelProps,
    descriptionProps,
    errorProps,
    value: currentValue,
    isComposing
  } = useTextField({
    id: restInputProps.id,
    name: restInputProps.name,
    type: resolvedType,
    value,
    defaultValue,
    required,
    disabled,
    readOnly,
    hasHelperText: Boolean(helperText),
    hasErrorText: Boolean(errorText),
    onValueChange,
    onCommit,
    describedByIds:
      typeof restInputProps["aria-describedby"] === "string"
        ? restInputProps["aria-describedby"].split(" ")
        : undefined
  });

  valueRef.current = currentValue;

  const internalInputRef = useRef<HTMLInputElement>(null);
  const mergedInputRef = composeRefs(internalInputRef, inputRef);

  const applyValue = useCallback((next: string) => {
    const inputElement = internalInputRef.current;

    if (!inputElement) return;

    const prototype = Object.getPrototypeOf(inputElement);
    const valueSetter =
      Object.getOwnPropertyDescriptor(prototype, "value")?.set ??
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;

    valueSetter?.call(inputElement, next);
    inputElement.dispatchEvent(new Event("input", { bubbles: true }));
  }, []);

  const handleClear = useCallback(() => {
    if (!clearable) return;
    if (disabled || readOnly || isComposing) return;
    if (!valueRef.current) return;

    applyValue("");
    internalInputRef.current?.focus({ preventScroll: true });
  }, [applyValue, clearable, disabled, isComposing, readOnly]);

  const handleTogglePassword = useCallback(() => {
    if (!passwordToggle || typeProp !== "password") return;
    if (disabled) return;
    setShowPassword((prev) => !prev);
    internalInputRef.current?.focus({ preventScroll: true });
  }, [disabled, passwordToggle, typeProp]);

  const handleFocus: FocusEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      if (!supportsFocusVisible) {
        setFocusVisible(true);
      } else {
        try {
          setFocusVisible(event.currentTarget.matches(":focus-visible"));
        } catch {
          setFocusVisible(true);
        }
      }
      onFocusProp?.(event);
    },
    [onFocusProp]
  );

  const handleBlur: FocusEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setFocusVisible(false);
      onBlurProp?.(event);
    },
    [onBlurProp]
  );

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      inputProps.onKeyDown(event as KeyboardEvent<HTMLInputElement>);
      if (event.defaultPrevented) return;

      if (event.key === "Escape") {
        handleClear();
      }

      onKeyDownProp?.(event);
    },
    [handleClear, inputProps, onKeyDownProp]
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      inputProps.onChange(event);
      onChangeProp?.(event);
    },
    [inputProps, onChangeProp]
  );

  const handleCompositionStart = useCallback(
    composeEventHandlers(inputProps.onCompositionStart, restInputProps.onCompositionStart),
    [inputProps, restInputProps.onCompositionStart]
  );

  const handleCompositionEnd = useCallback(
    composeEventHandlers(inputProps.onCompositionEnd, restInputProps.onCompositionEnd),
    [inputProps, restInputProps.onCompositionEnd]
  );

  const invalid = Boolean(errorText);
  const filled = Boolean(currentValue);

  const sizeTokens = SIZE_TOKENS[size];

  const controlStyle = useMemo<CSSProperties>(() => {
    const borderState = invalid ? "invalid" : isFocusVisible ? "focus" : disabled ? "disabled" : "default";
    const surfaceState = invalid ? "invalid" : isFocusVisible ? "focus" : disabled ? "disabled" : "default";
    const textState = disabled ? "disabled" : invalid ? "invalid" : "default";

    const borderColor = `var(--ara-tf-border-${borderState}, #cdd4e0)`;
    const surfaceColor = `var(--ara-tf-surface-${surfaceState}, #fff)`;
    const textColor = `var(--ara-tf-text-${textState}, var(--ara-color-role-light-text-strong, inherit))`;

    return {
      display: "inline-flex",
      alignItems: "center",
      width: "100%",
      boxSizing: "border-box",
      gap: `var(--ara-tf-gap, var(--ara-tf-size-${size}-gap, ${sizeTokens.gap}))`,
      paddingInline: `var(--ara-tf-px, var(--ara-tf-size-${size}-px, ${sizeTokens.paddingX}))`,
      paddingBlock: `var(--ara-tf-py, var(--ara-tf-size-${size}-py, ${sizeTokens.paddingY}))`,
      minHeight: `var(--ara-tf-size-${size}-height, ${sizeTokens.height})`,
      borderWidth: "var(--ara-tf-border-width, 1px)",
      borderStyle: "solid",
      borderColor,
      borderRadius: "var(--ara-tf-radius, 0.5rem)",
      backgroundColor: surfaceColor,
      color: textColor,
      opacity: disabled ? "var(--ara-tf-disabled-opacity, 0.6)" : 1,
      outline: isFocusVisible
        ? `var(--ara-tf-outline, 2px solid var(--ara-color-role-light-interactive-primary-focus-border, #5b8def))`
        : "none",
      boxShadow: isFocusVisible ? "var(--ara-tf-shadow-focus, 0 0 0 4px rgba(91, 141, 239, 0.2))" : undefined
    };
  }, [disabled, invalid, isFocusVisible, size, sizeTokens]);

  const inputStyle = useMemo<CSSProperties>(
    () => ({
      flex: 1,
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      font: "inherit",
      fontSize: `var(--ara-tf-size-${size}-font-size, ${sizeTokens.fontSize})`,
      lineHeight: `var(--ara-tf-size-${size}-line-height, ${sizeTokens.lineHeight})`,
      color: "inherit",
      padding: 0
    }),
    [size, sizeTokens.fontSize, sizeTokens.lineHeight]
  );

  const iconStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: `var(--ara-tf-size-${size}-icon, ${sizeTokens.icon})`,
    height: `var(--ara-tf-size-${size}-icon, ${sizeTokens.icon})`,
    flexShrink: 0
  };

  const actionButtonStyle: CSSProperties = {
    appearance: "none",
    border: "none",
    background: "transparent",
    color: "inherit",
    cursor: disabled ? "not-allowed" : "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: `var(--ara-tf-size-${size}-clear, ${sizeTokens.clear})`,
    height: `var(--ara-tf-size-${size}-clear, ${sizeTokens.clear})`,
    padding: 0,
    margin: 0
  };

  const showClearButton = clearable && filled && !disabled && !readOnly;
  const showPasswordToggle = passwordToggle && typeProp === "password";

  const mergedClassName = mergeClassNames("ara-text-field", className);

  return (
    <div
      ref={ref}
      className={mergedClassName}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: "0.25rem",
        fontFamily: "var(--ara-tf-font, var(--ara-typography-body, inherit))",
        ...style
      }}
      data-size={size}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      data-invalid={invalid || undefined}
      data-has-prefix={prefixIcon ? true : undefined}
      data-has-suffix={suffixIcon ? true : undefined}
      data-filled={filled || undefined}
      data-focus-visible={isFocusVisible || undefined}
    >
      {label ? (
        <label {...labelProps} className="ara-text-field__label">
          {label}
          {required ? <span aria-hidden="true">*</span> : null}
        </label>
      ) : null}

      <div className="ara-text-field__control" style={controlStyle}>
        {prefixIcon ? (
          <span className="ara-text-field__prefix" style={iconStyle} aria-hidden>
            {prefixIcon}
          </span>
        ) : null}

        <input
          {...restInputProps}
          {...inputProps}
          ref={mergedInputRef}
          type={resolvedType}
          autoComplete={autoComplete}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          className="ara-text-field__input"
          style={inputStyle}
        />

        {suffixIcon ? (
          <span className="ara-text-field__suffix" style={iconStyle} aria-hidden>
            {suffixIcon}
          </span>
        ) : null}

        {showClearButton ? (
          <button
            type="button"
            onClick={handleClear}
            onMouseDown={(event) => event.preventDefault()}
            className="ara-text-field__clear"
            style={actionButtonStyle}
            disabled={disabled}
            aria-label="입력 지우기"
          >
            ×
          </button>
        ) : null}

        {showPasswordToggle ? (
          <button
            type="button"
            onClick={handleTogglePassword}
            onMouseDown={(event) => event.preventDefault()}
            className="ara-text-field__toggle"
            style={{ ...actionButtonStyle, width: sizeTokens.toggle, height: sizeTokens.toggle }}
            disabled={disabled}
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보이기"}
            aria-pressed={showPassword}
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        ) : null}
      </div>

      {helperText ? (
        <p {...descriptionProps} className="ara-text-field__helper">
          {helperText}
        </p>
      ) : null}

      {errorText ? (
        <p {...errorProps} className="ara-text-field__error">
          {errorText}
        </p>
      ) : null}
    </div>
  );
});

TextField.displayName = "TextField";
