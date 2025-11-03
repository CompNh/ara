import {
  forwardRef,
  isValidElement,
  useCallback,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type FocusEventHandler,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type PointerEventHandler,
  type Ref
} from "react";
import { Slot } from "@radix-ui/react-slot";
import { useAraTheme } from "../../theme/index.js";
import { useButton, type PressHandler, type Theme } from "@ara/core";

// 버튼 변형(프라이머리, 세컨더리)
export type ButtonVariant = "primary" | "secondary";

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
  readonly variant?: ButtonVariant;
  readonly asChild?: boolean;
  readonly loading?: boolean;
  readonly onPress?: PressHandler;
  readonly onPressStart?: PressHandler;
  readonly onPressEnd?: PressHandler;
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

// variant별 스타일 구성
function getVariantStyle(variant: ButtonVariant, theme: Theme): CSSProperties {
  if (variant === "secondary") {
    return {
      backgroundColor: theme.color.neutral["100"],
      color: theme.color.brand["600"],
      borderColor: theme.color.brand["300"]
    };
  }
  return {
    backgroundColor: theme.color.brand["500"],
    color: theme.color.neutral["50"],
    borderColor: theme.color.brand["500"]
  };
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
    variant = "primary",
    asChild = false,
    href,
    className,
    style,
    disabled = false,
    loading = false,
    type = "button",
    onPress,
    onPressStart,
    onPressEnd,
    ...restProps
  } = props;

  const theme = useAraTheme();
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
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: "0.75rem",
    fontFamily: theme.typography.fontFamily.sans,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    lineHeight: theme.typography.lineHeight.normal,
    letterSpacing: theme.typography.letterSpacing.normal,
    cursor: interactionsDisabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition:
      "background-color 150ms ease, color 150ms ease, border-color 150ms ease, box-shadow 150ms ease, outline 150ms ease",
    textDecoration: "none",
    outline: "none"
  };

  // variant + focus 스타일 합성
  const variantStyle = getVariantStyle(variant, theme);
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
    style: { ...baseStyle, ...variantStyle, ...focusRingStyle, ...style },
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
        {children}
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
      {children}
    </button>
  );
});

Button.displayName = "Button";
