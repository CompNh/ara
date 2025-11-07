import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type FocusEventHandler,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactNode,
  type Ref
} from "react";
import { Slot } from "@radix-ui/react-slot";
import { useAraTheme } from "../../theme/index.js";
import { useButton, type PressHandler, type Theme } from "@ara/core";

// 버튼 변형(시각적 스타일)
export type ButtonVariant = "solid" | "outline" | "ghost";

// 버튼 톤(강조/의미)
export type ButtonTone = "primary" | "neutral" | "danger";

// 버튼 크기
export type ButtonSize = "sm" | "md" | "lg";

// 내부/소비자 이벤트 핸들러 타입
type ButtonEventHandlers = {
  readonly onClick?: MouseEventHandler<HTMLElement>;
  readonly onKeyDown?: KeyboardEventHandler<HTMLElement>;
  readonly onKeyUp?: KeyboardEventHandler<HTMLElement>;
  readonly onPointerEnter?: PointerEventHandler<HTMLElement>;
  readonly onPointerDown?: PointerEventHandler<HTMLElement>;
  readonly onPointerUp?: PointerEventHandler<HTMLElement>;
  readonly onPointerCancel?: PointerEventHandler<HTMLElement>;
  readonly onPointerLeave?: PointerEventHandler<HTMLElement>;
  readonly onFocus?: FocusEventHandler<HTMLElement>;
  readonly onBlur?: FocusEventHandler<HTMLElement>;
};

// 네이티브 버튼/앵커 속성 타입
type NativeButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
type AnchorButtonProps = AnchorHTMLAttributes<HTMLAnchorElement>;

// 버튼 자체 속성 정의
interface ButtonOwnProps {
  readonly variant?: ButtonVariant | null;
  readonly tone?: ButtonTone | null;
  readonly size?: ButtonSize | null;
  readonly asChild?: boolean;
  readonly loading?: boolean;
  readonly onPress?: PressHandler;
  readonly onPressStart?: PressHandler;
  readonly onPressEnd?: PressHandler;
  readonly leadingIcon?: ReactNode;
  readonly trailingIcon?: ReactNode;
  readonly fullWidth?: boolean;
}

export type ButtonProps = ButtonOwnProps & NativeButtonProps & AnchorButtonProps;

// 버튼의 실제 DOM element 타입
type ButtonElement = HTMLButtonElement | HTMLAnchorElement;

// className 병합 유틸
function mergeClassNames(...values: Array<string | undefined | null | false>): string {
  return values.filter(Boolean).join(" ");
}

type ButtonComponentTokens = Theme["component"]["button"];
type VariantTokens = ButtonComponentTokens["variant"][string][string];
type SizeTokens = ButtonComponentTokens["size"][string];

function getFirstRecordValue<T>(record: Record<string, T> | Readonly<Record<string, T>>): T {
  const [firstKey] = Object.keys(record);
  if (firstKey === undefined) {
    throw new Error("Button tokens are missing required values.");
  }
  const value = record[firstKey as keyof typeof record];
  if (value === undefined) {
    throw new Error("Button tokens are missing required values.");
  }
  return value as T;
}

function resolveVariantTokens(
  tokens: ButtonComponentTokens,
  variant: ButtonVariant,
  tone: ButtonTone
): VariantTokens {
  const variantMap = tokens.variant[variant] ?? getFirstRecordValue(tokens.variant);
  return variantMap[tone] ?? getFirstRecordValue(variantMap);
}

function resolveSizeTokens(tokens: ButtonComponentTokens, size: ButtonSize): SizeTokens {
  return tokens.size[size] ?? getFirstRecordValue(tokens.size);
}

// 브라우저가 :focus-visible CSS 선택자를 지원하는지 체크
const supportsFocusVisible = (() => {
  if (typeof window === "undefined" || typeof window.CSS === "undefined") return false;
  if (typeof window.CSS.supports !== "function") return false;
  try {
    return window.CSS.supports("selector(:focus-visible)");
  } catch {
    return false;
  }
})();

function normalizeVariant(value: ButtonVariant | null | undefined): ButtonVariant {
  if (value === "outline" || value === "ghost") {
    return value;
  }
  return "solid";
}

function normalizeTone(value: ButtonTone | null | undefined): ButtonTone {
  if (value === "neutral" || value === "danger") {
    return value;
  }
  return "primary";
}

function normalizeSize(value: ButtonSize | null | undefined): ButtonSize {
  if (value === "sm" || value === "lg") {
    return value;
  }
  return "md";
}

// 이벤트 핸들러 합성 (내부 핸들러 → 소비자 핸들러 순서로 실행)
// disabled/loading 시 소비자 핸들러는 건너뛰기
function composeEventHandlers<Event>(
  ours: ((event: Event) => void) | undefined,
  theirs: ((event: Event) => void) | undefined,
  options: { interactionsDisabled?: boolean } = {}
): ((event: Event) => void) | undefined {
  if (!ours && !theirs) return undefined;
  return (event: Event) => {
    ours?.(event);
    if (options.interactionsDisabled) return;
    theirs?.(event);
  };
}

// 메인 Button 컴포넌트
export const Button = forwardRef<ButtonElement, ButtonProps>(function Button(props, ref) {
  const {
    children,
    variant: variantProp,
    tone: toneProp,
    size: sizeProp,
    asChild = false,
    href,
    className,
    style,
    disabled = false,
    loading = false,
    type: typeProp = "button",
    onPress,
    onPressStart,
    onPressEnd,
    leadingIcon,
    trailingIcon,
    fullWidth = false,
    ...restProps
  } = props;

  const variant = normalizeVariant(variantProp);
  const tone = normalizeTone(toneProp);
  const size = normalizeSize(sizeProp);
  const type = typeProp ?? "button";

  const theme = useAraTheme();
  const buttonTokens = theme.component.button;
  const variantTokens = useMemo(
    () => resolveVariantTokens(buttonTokens, variant, tone),
    [buttonTokens, variant, tone]
  );
  const sizeTokens = useMemo(
    () => resolveSizeTokens(buttonTokens, size),
    [buttonTokens, size]
  );
  const elementType = asChild ? "custom" : href ? "link" : "button";
  const interactionsDisabled = disabled || loading;

  // focus-visible 상태 관리
  const [isFocusVisible, setFocusVisible] = useState(false);
  const [isHovered, setHovered] = useState(false);

  // core 훅으로부터 클릭/포인터/키보드 인터랙션 처리 props 획득
  const { buttonProps, isPressed } = useButton<HTMLElement>({
    disabled,
    loading,
    href,
    elementType,
    onPress,
    onPressStart,
    onPressEnd
  });

  useEffect(() => {
    if (interactionsDisabled) {
      setHovered(false);
    }
  }, [interactionsDisabled]);

  // 사용자 전달 props에서 이벤트 추출
  const {
    onClick,
    onKeyDown,
    onKeyUp,
    onPointerEnter,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onPointerLeave,
    onFocus,
    onBlur,
    ...domProps
  } = restProps;

  // 포커스 감지 (focus-visible 판별)
  const handleFocus: FocusEventHandler<HTMLElement> = useCallback(
    (event) => {
      if (interactionsDisabled) {
        setFocusVisible(false);
        return;
      }
      if (!supportsFocusVisible) {
        // jsdom 등 :focus-visible 미지원 환경에서는 항상 true
        setFocusVisible(true);
        return;
      }
      try {
        setFocusVisible(event.currentTarget.matches(":focus-visible"));
      } catch {
        setFocusVisible(true);
      }
    },
    [interactionsDisabled]
  );

  // blur 시 포커스 표시 해제
  const handleBlur: FocusEventHandler<HTMLElement> = useCallback(() => {
    setFocusVisible(false);
  }, []);

  const handlePointerEnter: PointerEventHandler<HTMLElement> = useCallback(
    () => {
      if (interactionsDisabled) return;
      setHovered(true);
    },
    [interactionsDisabled]
  );

  const handlePointerLeave: PointerEventHandler<HTMLElement> = useCallback(() => {
    setHovered(false);
  }, []);

  // 모든 이벤트 핸들러 합성 (내부 + 소비자)
  const interactionHandlers: ButtonEventHandlers = {
    onClick: composeEventHandlers(buttonProps.onClick, onClick, { interactionsDisabled }),
    onKeyDown: composeEventHandlers(buttonProps.onKeyDown, onKeyDown, { interactionsDisabled }),
    onKeyUp: composeEventHandlers(buttonProps.onKeyUp, onKeyUp, { interactionsDisabled }),
    onPointerEnter: composeEventHandlers(handlePointerEnter, onPointerEnter, { interactionsDisabled }),
    onPointerDown: composeEventHandlers(buttonProps.onPointerDown, onPointerDown, { interactionsDisabled }),
    onPointerUp: composeEventHandlers(buttonProps.onPointerUp, onPointerUp, { interactionsDisabled }),
    onPointerCancel: composeEventHandlers(
      composeEventHandlers(buttonProps.onPointerCancel, handlePointerLeave),
      onPointerCancel,
      { interactionsDisabled }
    ),
    onPointerLeave: composeEventHandlers(
      composeEventHandlers(buttonProps.onPointerLeave, handlePointerLeave),
      onPointerLeave,
      { interactionsDisabled }
    ),
    onFocus: composeEventHandlers(handleFocus, onFocus),
    onBlur: composeEventHandlers(handleBlur, onBlur)
  };

  // asChild가 true이고 유효한 React element면 polymorphic render
  const isPolymorphic = asChild && isValidElement(children);
  const baseClassName = "ara-button";
  const mergedClassName = mergeClassNames(baseClassName, className);

  // 기본 스타일 (테마 기반)
  const baseStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: `var(--ara-btn-gap, var(--ara-btn-size-${size}-gap, ${sizeTokens.gap}))`,
    paddingInline: `var(--ara-btn-px, var(--ara-btn-size-${size}-px, ${sizeTokens.paddingInline}))`,
    paddingBlock: `var(--ara-btn-py, var(--ara-btn-size-${size}-py, ${sizeTokens.paddingBlock}))`,
    paddingLeft: `var(--ara-btn-pl, var(--ara-btn-px, var(--ara-btn-size-${size}-px, ${sizeTokens.paddingInline})))`,
    paddingRight: `var(--ara-btn-pr, var(--ara-btn-px, var(--ara-btn-size-${size}-px, ${sizeTokens.paddingInline})))`,
    paddingTop: `var(--ara-btn-pt, var(--ara-btn-py, var(--ara-btn-size-${size}-py, ${sizeTokens.paddingBlock})))`,
    paddingBottom: `var(--ara-btn-pb, var(--ara-btn-py, var(--ara-btn-size-${size}-py, ${sizeTokens.paddingBlock})))`,
    minHeight: `var(--ara-btn-min-height, var(--ara-btn-size-${size}-min-height, ${sizeTokens.minHeight}))`,
    borderWidth: `var(--ara-btn-border-width, ${buttonTokens.borderWidth})`,
    borderStyle: "solid",
    borderRadius: `var(--ara-btn-radius, ${buttonTokens.radius})`,
    fontFamily: `var(--ara-btn-font, ${buttonTokens.font.family})`,
    fontSize: `var(--ara-btn-font-size, var(--ara-btn-size-${size}-font-size, ${sizeTokens.fontSize}))`,
    fontWeight: `var(--ara-btn-font-weight, ${buttonTokens.font.weight})`,
    lineHeight: `var(--ara-btn-line-height, var(--ara-btn-size-${size}-line-height, ${sizeTokens.lineHeight}))`,
    letterSpacing: theme.typography.letterSpacing.normal,
    cursor: interactionsDisabled ? "not-allowed" : "pointer",
    opacity: disabled
      ? `var(--ara-btn-disabled-opacity, ${buttonTokens.disabled.opacity})`
      : 1,
    transition:
      "background-color 150ms ease, color 150ms ease, border-color 150ms ease, box-shadow 150ms ease, outline 150ms ease, transform 150ms ease",
    textDecoration: "none",
    outline: "none",
    transform: "translateY(0)"
  };

  const hasLabel = Children.count(children) > 0;
  const iconStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  };
  const leadingIconNode = leadingIcon ? (
    <span
      className="ara-button__icon ara-button__icon--leading"
      aria-hidden={hasLabel ? true : undefined}
      style={iconStyle}
    >
      {leadingIcon}
    </span>
  ) : null;
  const trailingIconNode = trailingIcon ? (
    <span
      className="ara-button__icon ara-button__icon--trailing"
      aria-hidden={hasLabel ? true : undefined}
      style={iconStyle}
    >
      {trailingIcon}
    </span>
  ) : null;
  const spinnerNode = loading ? (
    <span
      className="ara-button__spinner"
      aria-hidden="true"
      style={{
        ...iconStyle,
        width: `var(--ara-btn-spinner-size, var(--ara-btn-size-${size}-spinner, ${sizeTokens.spinnerSize}))`,
        height: `var(--ara-btn-spinner-size, var(--ara-btn-size-${size}-spinner, ${sizeTokens.spinnerSize}))`
      }}
    >
      <svg
        role="presentation"
        viewBox="0 0 24 24"
        width={`var(--ara-btn-spinner-size, var(--ara-btn-size-${size}-spinner, ${sizeTokens.spinnerSize}))`}
        height={`var(--ara-btn-spinner-size, var(--ara-btn-size-${size}-spinner, ${sizeTokens.spinnerSize}))`}
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2"
          strokeOpacity="0.25"
          fill="none"
        />
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="56"
          strokeDashoffset="28"
          fill="none"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 12 12;360 12 12"
            dur="0.75s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </span>
  ) : null;

  const labelNode = hasLabel ? (
    <span className="ara-button__label">{children}</span>
  ) : null;

  const content = (
    <>
      {spinnerNode}
      {!loading && leadingIconNode}
      {labelNode}
      {!loading && trailingIconNode}
    </>
  );

  const baseBackgroundValue = `var(--ara-btn-bg, var(--ara-btn-variant-${variant}-${tone}-bg, ${variantTokens.background}))`;
  const hoverBackgroundValue = `var(--ara-btn-bg-hover, var(--ara-btn-variant-${variant}-${tone}-bg-hover, ${variantTokens.backgroundHover}))`;
  const activeBackgroundValue = `var(--ara-btn-bg-active, var(--ara-btn-variant-${variant}-${tone}-bg-active, ${variantTokens.backgroundActive}))`;
  const baseForegroundValue = `var(--ara-btn-fg, var(--ara-btn-variant-${variant}-${tone}-fg, ${variantTokens.foreground}))`;
  const hoverForegroundValue = `var(--ara-btn-fg-hover, var(--ara-btn-variant-${variant}-${tone}-fg-hover, ${variantTokens.foregroundHover}))`;
  const activeForegroundValue = `var(--ara-btn-fg-active, var(--ara-btn-variant-${variant}-${tone}-fg-active, ${variantTokens.foregroundActive}))`;
  const baseBorderValue = `var(--ara-btn-border, var(--ara-btn-variant-${variant}-${tone}-border, ${variantTokens.border}))`;
  const hoverBorderValue = `var(--ara-btn-border-hover, var(--ara-btn-variant-${variant}-${tone}-border-hover, ${variantTokens.borderHover}))`;
  const activeBorderValue = `var(--ara-btn-border-active, var(--ara-btn-variant-${variant}-${tone}-border-active, ${variantTokens.borderActive}))`;
  const baseShadowValue = `var(--ara-btn-shadow, var(--ara-btn-variant-${variant}-${tone}-shadow, ${variantTokens.shadow ?? "none"}))`;

  // variant + focus 스타일 합성
  const variantStyle: CSSProperties = {
    backgroundColor: baseBackgroundValue,
    color: baseForegroundValue,
    borderColor: baseBorderValue,
    boxShadow: baseShadowValue
  };

  const interactionStyle: CSSProperties | undefined = isPressed
    ? {
        backgroundColor: activeBackgroundValue,
        color: activeForegroundValue,
        borderColor: activeBorderValue,
        transform: "translateY(1px)"
      }
    : isHovered
      ? {
          backgroundColor: hoverBackgroundValue,
          color: hoverForegroundValue,
          borderColor: hoverBorderValue
        }
      : undefined;
  const focusRingStyle: CSSProperties | undefined = isFocusVisible
    ? {
        outline: `var(--ara-btn-focus-outline, ${buttonTokens.focus.outlineWidth} solid ${buttonTokens.focus.outlineColor})`,
        outlineOffset: `var(--ara-btn-focus-outline-offset, ${buttonTokens.focus.outlineOffset})`,
        boxShadow: `var(--ara-btn-focus-ring, 0 0 0 ${buttonTokens.focus.ringSize} ${buttonTokens.focus.ringColor})`
      }
    : undefined;

  // 상태별 data-* 속성 설정
  const dataAttributes = {
    "data-variant": variant,
    "data-tone": tone,
    "data-size": size,
    "data-disabled": disabled ? "" : undefined,
    "data-loading": loading ? "" : undefined,
    "data-focus-visible": isFocusVisible ? "" : undefined,
    "data-hovered": isHovered ? "" : undefined,
    "data-pressed": isPressed ? "" : undefined,
    "data-state": isPressed ? "pressed" : isFocusVisible ? "focus-visible" : isHovered ? "hover" : undefined
  } as const;

  // 최종 핸들러 병합
  const composedHandlers = {
    ...buttonProps,
    ...interactionHandlers
  };

  // 링크일 경우 접근성 속성 보강
  const anchorAccessibilityProps = href
    ? {
        href,
        "aria-disabled": disabled || loading ? true : undefined,
        tabIndex: interactionsDisabled ? -1 : undefined
      }
    : {};

  // custom(asChild) 또는 링크의 경우 role/tabIndex 지정
  const role = elementType === "custom" && !href ? "button" : undefined;
  const tabIndex =
    elementType === "custom" && !href
      ? interactionsDisabled
        ? -1
        : 0
      : undefined;

  const accessibilityProps = {
    ...(role ? { role } : {}),
    ...(tabIndex !== undefined ? { tabIndex } : {}),
    ...(interactionsDisabled ? { "aria-disabled": true } : {})
  } as const;

  // 공통 props
  const baseProps = {
    ...domProps,
    ...composedHandlers,
    ...dataAttributes,
    className: mergedClassName,
    style: {
      ...baseStyle,
      ...variantStyle,
      ...interactionStyle,
      ...focusRingStyle,
      ...style,
      ...(fullWidth ? { width: "100%" } : {}),
      "--ara-btn-bg": `var(--ara-btn-variant-${variant}-${tone}-bg, ${variantTokens.background})`,
      "--ara-btn-bg-hover": `var(--ara-btn-variant-${variant}-${tone}-bg-hover, ${variantTokens.backgroundHover})`,
      "--ara-btn-bg-active": `var(--ara-btn-variant-${variant}-${tone}-bg-active, ${variantTokens.backgroundActive})`,
      "--ara-btn-fg": `var(--ara-btn-variant-${variant}-${tone}-fg, ${variantTokens.foreground})`,
      "--ara-btn-fg-hover": `var(--ara-btn-variant-${variant}-${tone}-fg-hover, ${variantTokens.foregroundHover})`,
      "--ara-btn-fg-active": `var(--ara-btn-variant-${variant}-${tone}-fg-active, ${variantTokens.foregroundActive})`,
      "--ara-btn-border": `var(--ara-btn-variant-${variant}-${tone}-border, ${variantTokens.border})`,
      "--ara-btn-border-hover": `var(--ara-btn-variant-${variant}-${tone}-border-hover, ${variantTokens.borderHover})`,
      "--ara-btn-border-active": `var(--ara-btn-variant-${variant}-${tone}-border-active, ${variantTokens.borderActive})`,
      "--ara-btn-shadow": `var(--ara-btn-variant-${variant}-${tone}-shadow, ${variantTokens.shadow ?? "none"})`,
      "--ara-btn-gap": `var(--ara-btn-size-${size}-gap, ${sizeTokens.gap})`,
      "--ara-btn-px": `var(--ara-btn-size-${size}-px, ${sizeTokens.paddingInline})`,
      "--ara-btn-py": `var(--ara-btn-size-${size}-py, ${sizeTokens.paddingBlock})`,
      "--ara-btn-min-height": `var(--ara-btn-size-${size}-min-height, ${sizeTokens.minHeight})`,
      "--ara-btn-font-size": `var(--ara-btn-size-${size}-font-size, ${sizeTokens.fontSize})`,
      "--ara-btn-line-height": `var(--ara-btn-size-${size}-line-height, ${sizeTokens.lineHeight})`,
      "--ara-btn-spinner-size": `var(--ara-btn-size-${size}-spinner, ${sizeTokens.spinnerSize})`
    },
    "aria-busy": loading || undefined
  };

  // ① asChild일 때 (Slot 사용)
  if (isPolymorphic) {
    return (
      <Slot
        {...baseProps}
        {...anchorAccessibilityProps}
        {...accessibilityProps}
        ref={ref as Ref<HTMLElement>}
      >
        {children}
      </Slot>
    );
  }

  // ② href 있을 때 (anchor)
  if (href) {
    return (
      <a
        {...baseProps}
        {...anchorAccessibilityProps}
        {...accessibilityProps}
        ref={ref as Ref<HTMLAnchorElement>}
      >
        {content}
      </a>
    );
  }

  // ③ 기본 button element
  return (
    <button
      {...baseProps}
      {...accessibilityProps}
      type={type}
      disabled={disabled || loading}
      ref={ref as Ref<HTMLButtonElement>}
    >
      {content}
    </button>
  );
});

Button.displayName = "Button";
