import {
  forwardRef,
  useCallback,
  useEffect,
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
  readonly helperTextMatchFieldWidth?: boolean;
  readonly prefixIcon?: ReactNode;
  readonly suffixIcon?: ReactNode;
  readonly suffixAction?: ReactNode;
  readonly clearable?: boolean;
  readonly passwordToggle?: boolean;
  readonly maxLengthCounter?: boolean;
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

const STATE_TOKENS = {
  surface: {
    default: "#fff",
    hover: "#f8fafc",
    focus: "#fff",
    disabled: "#f9fafb",
    invalid: "#fff"
  },
  border: {
    default: "#cdd4e0",
    hover: "#9ca3af",
    focus: "#5b8def",
    disabled: "#e5e7eb",
    invalid: "#ef4444"
  },
  text: {
    default: "var(--ara-color-role-light-text-strong, inherit)",
    disabled: "#9ca3af",
    invalid: "#b91c1c"
  }
};

export const TextField = forwardRef<HTMLDivElement, TextFieldProps>(function TextField(
  props,
  ref
) {
  const {
    label,
    helperText,
    helperTextMatchFieldWidth = false,
    errorText,
    prefixIcon,
    suffixIcon,
    suffixAction,
    clearable = false,
    passwordToggle = false,
    maxLengthCounter = false,
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
  const [isHovered, setHovered] = useState(false);
  const controlRef = useRef<HTMLDivElement>(null);
  const [controlWidth, setControlWidth] = useState<number>();

  useEffect(() => {
    if (!helperTextMatchFieldWidth) return;

    const element = controlRef.current;

    if (!element) return;

    const updateWidth = () => setControlWidth(element.getBoundingClientRect().width);

    updateWidth();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setControlWidth(entry.contentRect.width);
      }
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [helperTextMatchFieldWidth]);

  const resolvedType: TextFieldType =
    passwordToggle && typeProp === "password" && showPassword ? "text" : typeProp;
  const isReadOnly = readOnly && !disabled;

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
    hasLabel: Boolean(label),
    hasHelperText: Boolean(helperText),
    hasErrorText: Boolean(errorText),
    onValueChange,
    onCommit,
    describedByIds:
      typeof restInputProps["aria-describedby"] === "string"
        ? restInputProps["aria-describedby"].split(" ").filter(Boolean)
        : undefined,
    labelledByIds:
      typeof restInputProps["aria-labelledby"] === "string"
        ? restInputProps["aria-labelledby"].split(" ").filter(Boolean)
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

  const handleCompositionStart = useMemo(
    () => composeEventHandlers(inputProps.onCompositionStart, restInputProps.onCompositionStart),
    [inputProps.onCompositionStart, restInputProps.onCompositionStart]
  );

  const handleCompositionEnd = useMemo(
    () => composeEventHandlers(inputProps.onCompositionEnd, restInputProps.onCompositionEnd),
    [inputProps.onCompositionEnd, restInputProps.onCompositionEnd]
  );

  const invalid = Boolean(errorText);
  const filled = Boolean(currentValue);

  const sizeTokens = SIZE_TOKENS[size];
  const maxLengthValue =
    typeof restInputProps.maxLength === "number"
      ? restInputProps.maxLength
      : Number.isFinite(Number(restInputProps.maxLength))
        ? Number(restInputProps.maxLength)
        : undefined;

  const shouldShowCounter = Boolean(maxLengthCounter && maxLengthValue && maxLengthValue > 0);

  const cssVariables = useMemo(() => {
    const sizeVariables: Record<string, string> = {};

    for (const [tokenSize, tokens] of Object.entries(SIZE_TOKENS)) {
      sizeVariables[`--ara-tf-size-${tokenSize}-height`] = tokens.height;
      sizeVariables[`--ara-tf-size-${tokenSize}-px`] = tokens.paddingX;
      sizeVariables[`--ara-tf-size-${tokenSize}-py`] = tokens.paddingY;
      sizeVariables[`--ara-tf-size-${tokenSize}-gap`] = tokens.gap;
      sizeVariables[`--ara-tf-size-${tokenSize}-font-size`] = tokens.fontSize;
      sizeVariables[`--ara-tf-size-${tokenSize}-line-height`] = tokens.lineHeight;
      sizeVariables[`--ara-tf-size-${tokenSize}-icon`] = tokens.icon;
      sizeVariables[`--ara-tf-size-${tokenSize}-clear`] = tokens.clear;
      sizeVariables[`--ara-tf-size-${tokenSize}-toggle`] = tokens.toggle;
    }

    return {
      "--ara-tf-font": "var(--ara-typography-body, inherit)",
      "--ara-tf-font-weight": "inherit",
      "--ara-tf-radius": "0.5rem",
      "--ara-tf-border-width": "1px",
      "--ara-tf-disabled-opacity": "0.6",
      "--ara-tf-outline": "2px solid var(--ara-color-role-light-interactive-primary-focus-border, #5b8def)",
      "--ara-tf-shadow-focus": "0 0 0 4px rgba(91, 141, 239, 0.2)",
      "--ara-tf-surface-default": STATE_TOKENS.surface.default,
      "--ara-tf-surface-hover": STATE_TOKENS.surface.hover,
      "--ara-tf-surface-focus": STATE_TOKENS.surface.focus,
      "--ara-tf-surface-disabled": STATE_TOKENS.surface.disabled,
      "--ara-tf-surface-invalid": STATE_TOKENS.surface.invalid,
      "--ara-tf-border-default": STATE_TOKENS.border.default,
      "--ara-tf-border-hover": STATE_TOKENS.border.hover,
      "--ara-tf-border-focus": STATE_TOKENS.border.focus,
      "--ara-tf-border-disabled": STATE_TOKENS.border.disabled,
      "--ara-tf-border-invalid": STATE_TOKENS.border.invalid,
      "--ara-tf-text-default": STATE_TOKENS.text.default,
      "--ara-tf-text-disabled": STATE_TOKENS.text.disabled,
      "--ara-tf-text-invalid": STATE_TOKENS.text.invalid,
      ...sizeVariables
    } satisfies Record<string, string>;
  }, []);

  const controlStyle = useMemo<CSSProperties>(() => {
    const borderState = disabled
      ? "disabled"
      : invalid
        ? "invalid"
        : isFocusVisible
          ? "focus"
          : isHovered
            ? "hover"
            : "default";
    const surfaceState = disabled
      ? "disabled"
      : invalid
        ? "invalid"
        : isFocusVisible
          ? "focus"
          : isHovered
            ? "hover"
            : "default";
    const textState = disabled ? "disabled" : invalid ? "invalid" : "default";

    const borderColor = `var(--ara-tf-border-${borderState}, ${STATE_TOKENS.border.default})`;
    const surfaceColor = `var(--ara-tf-surface-${surfaceState}, ${STATE_TOKENS.surface.default})`;
    const textColor = `var(--ara-tf-text-${textState}, ${STATE_TOKENS.text.default})`;

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
  }, [disabled, invalid, isFocusVisible, isHovered, size, sizeTokens]);

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

  const suffixActionStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    flexShrink: 0
  };

  const helperStyle: CSSProperties = {
    margin: 0,
    alignSelf: helperTextMatchFieldWidth ? "stretch" : "flex-start",
    maxWidth: helperTextMatchFieldWidth
      ? controlWidth
        ? `${controlWidth}px`
        : "100%"
      : undefined,
    width: helperTextMatchFieldWidth
      ? controlWidth
        ? `${controlWidth}px`
        : "100%"
      : undefined,
    color: "var(--ara-tf-helper-text, #6b7280)",
    fontSize: "0.8125rem",
    lineHeight: "1.35",
    overflowWrap: "break-word",
    wordBreak: "break-word"
  };

  const errorStyle: CSSProperties = {
    margin: "-0.125rem 0 0 0",
    alignSelf: helperTextMatchFieldWidth ? "stretch" : "flex-start",
    maxWidth: helperTextMatchFieldWidth
      ? controlWidth
        ? `${controlWidth}px`
        : "100%"
      : undefined,
    width: helperTextMatchFieldWidth
      ? controlWidth
        ? `${controlWidth}px`
        : "100%"
      : undefined,
    color: `var(--ara-tf-text-invalid, ${STATE_TOKENS.text.invalid})`,
    fontSize: "0.8125rem",
    lineHeight: "1.35",
    overflowWrap: "break-word",
    wordBreak: "break-word"
  };

  const showClearButton = clearable && filled && !disabled && !readOnly;
  const showPasswordToggle = passwordToggle && typeProp === "password";

  const mergedClassName = mergeClassNames("ara-text-field", className);

  return (
    <div
      ref={ref}
      className={mergedClassName}
      style={{
        ...cssVariables,
        display: "inline-flex",
        flexDirection: "column",
        gap: "0.25rem",
        fontFamily: "var(--ara-tf-font, var(--ara-typography-body, inherit))",
        fontWeight: "var(--ara-tf-font-weight, inherit)",
        ...style
      }}
      data-size={size}
      data-disabled={disabled || undefined}
      data-readonly={isReadOnly || undefined}
      data-invalid={invalid || undefined}
      data-has-prefix={prefixIcon ? true : undefined}
      data-has-suffix={suffixIcon || suffixAction ? true : undefined}
      data-filled={filled || undefined}
      data-focus-visible={isFocusVisible || undefined}
    >
      {label ? (
        <label {...labelProps} className="ara-text-field__label">
          {label}
          {required ? <span aria-hidden="true">*</span> : null}
        </label>
      ) : null}

      {helperText ? (
        <p {...descriptionProps} className="ara-text-field__helper" style={helperStyle}>
          {helperText}
        </p>
      ) : null}

      <div
        ref={controlRef}
        className="ara-text-field__control"
        style={controlStyle}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
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

        {suffixAction ? (
          <span className="ara-text-field__suffix-action" style={suffixActionStyle}>
            {suffixAction}
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

      {errorText ? (
        <p {...errorProps} className="ara-text-field__error" style={errorStyle}>
          {errorText}
        </p>
      ) : null}

      {shouldShowCounter ? (
        <span
          className="ara-text-field__counter"
          style={{
            alignSelf: "flex-end",
            color: "var(--ara-tf-text-default, var(--ara-color-role-light-text-strong, inherit))",
            fontSize: "0.875rem",
            lineHeight: "1.4"
          }}
        >
          {currentValue.length}/{maxLengthValue}
        </span>
      ) : null}
    </div>
  );
});

TextField.displayName = "TextField";
