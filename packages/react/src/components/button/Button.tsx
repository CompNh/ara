import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
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

type VariantVariables = {
  readonly background: string;
  readonly foreground: string;
  readonly border: string;
  readonly backgroundHover: string;
  readonly foregroundHover: string;
  readonly borderHover: string;
  readonly backgroundActive: string;
  readonly foregroundActive: string;
  readonly borderActive: string;
  readonly shadow?: string;
};

type TonePalette = {
  readonly base: string;
  readonly emphasis: string;
  readonly emphasisAlt: string;
  readonly contrast: string;
  readonly subtle: string;
  readonly subtleAlt: string;
};

function getTonePalette(tone: ButtonTone | null | undefined, theme: Theme): TonePalette {
  if (tone === "neutral") {
    return {
      base: theme.color.neutral["100"],
      emphasis: theme.color.neutral["200"],
      emphasisAlt: theme.color.neutral["300"],
      subtle: theme.color.neutral["50"],
      subtleAlt: theme.color.neutral["100"],
      contrast: theme.color.neutral["900"]
    };
  }

  if (tone === "danger") {
    return {
      base: theme.color.accent["500"],
      emphasis: theme.color.accent["600"],
      emphasisAlt: theme.color.accent["700"],
      subtle: theme.color.accent["100"],
      subtleAlt: theme.color.accent["200"],
      contrast: theme.color.neutral["50"]
    };
  }

  return {
    base: theme.color.brand["500"],
    emphasis: theme.color.brand["600"],
    emphasisAlt: theme.color.brand["700"],
    subtle: theme.color.brand["50"],
    subtleAlt: theme.color.brand["100"],
    contrast: theme.color.neutral["50"]
  };
}

function getVariantVariables(
  variant: ButtonVariant | null | undefined,
  palette: TonePalette
): VariantVariables {
  if (variant === "outline") {
    return {
      background: "transparent",
      foreground: palette.base,
      border: palette.base,
      backgroundHover: palette.subtle,
      foregroundHover: palette.emphasis,
      borderHover: palette.emphasis,
      backgroundActive: palette.subtleAlt,
      foregroundActive: palette.emphasisAlt,
      borderActive: palette.emphasisAlt
    };
  }

  if (variant === "ghost") {
    return {
      background: "transparent",
      foreground: palette.base,
      border: "transparent",
      backgroundHover: palette.subtle,
      foregroundHover: palette.emphasis,
      borderHover: "transparent",
      backgroundActive: palette.subtleAlt,
      foregroundActive: palette.emphasisAlt,
      borderActive: "transparent"
    };
  }

  return {
    background: palette.base,
    foreground: palette.contrast,
    border: palette.base,
    backgroundHover: palette.emphasis,
    foregroundHover: palette.contrast,
    borderHover: palette.emphasis,
    backgroundActive: palette.emphasisAlt,
    foregroundActive: palette.contrast,
    borderActive: palette.emphasisAlt
  };
}

type SizeVariables = {
  readonly paddingInline: string;
  readonly paddingBlock: string;
  readonly gap: string;
  readonly fontSize: string;
  readonly lineHeight: string;
  readonly minHeight: string;
  readonly spinnerSize: number;
};

function getSizeVariables(size: ButtonSize | null | undefined, theme: Theme): SizeVariables {
  if (size === "sm") {
    return {
      paddingInline: "0.75rem",
      paddingBlock: "0.375rem",
      gap: "0.375rem",
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.normal,
      minHeight: "2.25rem",
      spinnerSize: 16
    };
  }

  if (size === "lg") {
    return {
      paddingInline: "1.25rem",
      paddingBlock: "0.75rem",
      gap: "0.75rem",
      fontSize: theme.typography.fontSize.lg,
      lineHeight: theme.typography.lineHeight.normal,
      minHeight: "3rem",
      spinnerSize: 20
    };
  }

  return {
    paddingInline: "1rem",
    paddingBlock: "0.5rem",
    gap: "0.5rem",
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.lineHeight.normal,
    minHeight: "2.5rem",
    spinnerSize: 18
  };
}

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
  const tonePalette = useMemo(() => getTonePalette(tone, theme), [tone, theme]);
  const variantVariables = useMemo(
    () => getVariantVariables(variant, tonePalette),
    [variant, tonePalette]
  );
  const sizeVariables = useMemo(() => getSizeVariables(size, theme), [size, theme]);
  const elementType = asChild ? "custom" : href ? "link" : "button";
  const interactionsDisabled = disabled || loading;

  // focus-visible 상태 관리
  const [isFocusVisible, setFocusVisible] = useState(false);

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

  // 사용자 전달 props에서 이벤트 추출
  const {
    onClick,
    onKeyDown,
    onKeyUp,
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

  // 모든 이벤트 핸들러 합성 (내부 + 소비자)
  const interactionHandlers: ButtonEventHandlers = {
    onClick: composeEventHandlers(buttonProps.onClick, onClick, { interactionsDisabled }),
    onKeyDown: composeEventHandlers(buttonProps.onKeyDown, onKeyDown, { interactionsDisabled }),
    onKeyUp: composeEventHandlers(buttonProps.onKeyUp, onKeyUp, { interactionsDisabled }),
    onPointerDown: composeEventHandlers(buttonProps.onPointerDown, onPointerDown, { interactionsDisabled }),
    onPointerUp: composeEventHandlers(buttonProps.onPointerUp, onPointerUp, { interactionsDisabled }),
    onPointerCancel: composeEventHandlers(buttonProps.onPointerCancel, onPointerCancel, { interactionsDisabled }),
    onPointerLeave: composeEventHandlers(buttonProps.onPointerLeave, onPointerLeave, { interactionsDisabled }),
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
    gap: `var(--ara-btn-gap, ${sizeVariables.gap})`,
    paddingInline: `var(--ara-btn-px, ${sizeVariables.paddingInline})`,
    paddingBlock: `var(--ara-btn-py, ${sizeVariables.paddingBlock})`,
    paddingLeft: `var(--ara-btn-pl, var(--ara-btn-px, ${sizeVariables.paddingInline}))`,
    paddingRight: `var(--ara-btn-pr, var(--ara-btn-px, ${sizeVariables.paddingInline}))`,
    paddingTop: `var(--ara-btn-pt, var(--ara-btn-py, ${sizeVariables.paddingBlock}))`,
    paddingBottom: `var(--ara-btn-pb, var(--ara-btn-py, ${sizeVariables.paddingBlock}))`,
    minHeight: `var(--ara-btn-min-height, ${sizeVariables.minHeight})`,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: "var(--ara-btn-radius, 0.75rem)",
    fontFamily: `var(--ara-btn-font, ${theme.typography.fontFamily.sans})`,
    fontSize: `var(--ara-btn-font-size, ${sizeVariables.fontSize})`,
    fontWeight: theme.typography.fontWeight.medium,
    lineHeight: `var(--ara-btn-line-height, ${sizeVariables.lineHeight})`,
    letterSpacing: theme.typography.letterSpacing.normal,
    cursor: interactionsDisabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition:
      "background-color 150ms ease, color 150ms ease, border-color 150ms ease, box-shadow 150ms ease, outline 150ms ease",
    textDecoration: "none",
    outline: "none"
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
        width: sizeVariables.spinnerSize,
        height: sizeVariables.spinnerSize
      }}
    >
      <svg
        role="presentation"
        viewBox="0 0 24 24"
        width={sizeVariables.spinnerSize}
        height={sizeVariables.spinnerSize}
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

  // variant + focus 스타일 합성
  const variantStyle: CSSProperties = {
    backgroundColor: variantVariables.background,
    color: variantVariables.foreground,
    borderColor: variantVariables.border,
    boxShadow: variantVariables.shadow ?? "none"
  };
  const focusRingStyle: CSSProperties | undefined = isFocusVisible
    ? {
        outline: `2px solid ${theme.color.brand["300"]}`,
        outlineOffset: 2,
        boxShadow: `0 0 0 4px ${theme.color.brand["100"]}`
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
    "data-state": isPressed ? "pressed" : isFocusVisible ? "focus-visible" : undefined
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
      ...focusRingStyle,
      ...style,
      ...(fullWidth ? { width: "100%" } : {}),
      "--ara-btn-bg": variantVariables.background,
      "--ara-btn-bg-hover": variantVariables.backgroundHover,
      "--ara-btn-bg-active": variantVariables.backgroundActive,
      "--ara-btn-fg": variantVariables.foreground,
      "--ara-btn-fg-hover": variantVariables.foregroundHover,
      "--ara-btn-fg-active": variantVariables.foregroundActive,
      "--ara-btn-border": variantVariables.border,
      "--ara-btn-border-hover": variantVariables.borderHover,
      "--ara-btn-border-active": variantVariables.borderActive,
      "--ara-btn-gap": sizeVariables.gap,
      "--ara-btn-px": sizeVariables.paddingInline,
      "--ara-btn-py": sizeVariables.paddingBlock,
      "--ara-btn-min-height": sizeVariables.minHeight,
      "--ara-btn-font-size": sizeVariables.fontSize,
      "--ara-btn-line-height": sizeVariables.lineHeight,
      "--ara-btn-font": theme.typography.fontFamily.sans,
      "--ara-btn-radius": "0.75rem"
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
