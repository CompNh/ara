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

export type ButtonVariant = "primary" | "secondary";

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

type NativeButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
type AnchorButtonProps = AnchorHTMLAttributes<HTMLAnchorElement>;

interface ButtonOwnProps {
  readonly variant?: ButtonVariant;
  readonly asChild?: boolean;
  readonly loading?: boolean;
  readonly onPress?: PressHandler;
  readonly onPressStart?: PressHandler;
  readonly onPressEnd?: PressHandler;
}

export type ButtonProps = ButtonOwnProps & NativeButtonProps & AnchorButtonProps;

type ButtonElement = HTMLButtonElement | HTMLAnchorElement;

function mergeClassNames(...values: Array<string | undefined | null | false>): string {
  return values.filter(Boolean).join(" ");
}

const supportsFocusVisible = (() => {
  if (typeof window === "undefined" || typeof window.CSS === "undefined") {
    return false;
  }

  if (typeof window.CSS.supports !== "function") {
    return false;
  }

  try {
    return window.CSS.supports("selector(:focus-visible)");
  } catch {
    return false;
  }
})();

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

function composeEventHandlers<Event>(
  ours: ((event: Event) => void) | undefined,
  theirs: ((event: Event) => void) | undefined,
  options: { interactionsDisabled?: boolean } = {}
): ((event: Event) => void) | undefined {
  if (!ours && !theirs) {
    return undefined;
  }

  return (event: Event) => {
    ours?.(event);

    if (options.interactionsDisabled) {
      return;
    }

    theirs?.(event);
  };
}

export const Button = forwardRef<ButtonElement, ButtonProps>(function Button(
  props,
  ref
) {
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
  const [isFocusVisible, setFocusVisible] = useState(false);

  const { buttonProps, isPressed } = useButton<HTMLElement>({
    disabled,
    loading,
    href,
    elementType,
    onPress,
    onPressStart,
    onPressEnd
  });

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

  const handleFocus: FocusEventHandler<HTMLElement> = useCallback(
    (event) => {
      if (interactionsDisabled) {
        setFocusVisible(false);
        return;
      }

      if (!supportsFocusVisible) {
        // `:focus-visible` 미지원 환경(jsdom 등)에서는 키보드 유입으로 간주한다.
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

  const handleBlur: FocusEventHandler<HTMLElement> = useCallback(() => {
    setFocusVisible(false);
  }, []);

  const interactionHandlers: ButtonEventHandlers = {
    onClick: composeEventHandlers(
      buttonProps.onClick,
      onClick as MouseEventHandler<HTMLElement> | undefined,
      { interactionsDisabled }
    ),
    onKeyDown: composeEventHandlers(
      buttonProps.onKeyDown,
      onKeyDown as KeyboardEventHandler<HTMLElement> | undefined,
      { interactionsDisabled }
    ),
    onKeyUp: composeEventHandlers(
      buttonProps.onKeyUp,
      onKeyUp as KeyboardEventHandler<HTMLElement> | undefined,
      { interactionsDisabled }
    ),
    onPointerDown: composeEventHandlers(
      buttonProps.onPointerDown,
      onPointerDown as PointerEventHandler<HTMLElement> | undefined,
      { interactionsDisabled }
    ),
    onPointerUp: composeEventHandlers(
      buttonProps.onPointerUp,
      onPointerUp as PointerEventHandler<HTMLElement> | undefined,
      { interactionsDisabled }
    ),
    onPointerCancel: composeEventHandlers(
      buttonProps.onPointerCancel,
      onPointerCancel as PointerEventHandler<HTMLElement> | undefined,
      { interactionsDisabled }
    ),
    onPointerLeave: composeEventHandlers(
      buttonProps.onPointerLeave,
      onPointerLeave as PointerEventHandler<HTMLElement> | undefined,
      { interactionsDisabled }
    ),
    onFocus: composeEventHandlers(
      handleFocus,
      onFocus as FocusEventHandler<HTMLElement> | undefined
    ),
    onBlur: composeEventHandlers(
      handleBlur,
      onBlur as FocusEventHandler<HTMLElement> | undefined
    )
  };

  const isPolymorphic = asChild && isValidElement(children);
  const baseClassName = "ara-button";
  const mergedClassName = mergeClassNames(baseClassName, className);

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

  const variantStyle = getVariantStyle(variant, theme);
  const focusRingStyle: CSSProperties | undefined = isFocusVisible
    ? {
        outline: `2px solid ${theme.color.brand["300"]}`,
        outlineOffset: 2,
        boxShadow: `0 0 0 4px ${theme.color.brand["100"]}`
      }
    : undefined;

  const dataAttributes = {
    "data-variant": variant,
    "data-disabled": disabled ? "" : undefined,
    "data-loading": loading ? "" : undefined,
    "data-focus-visible": isFocusVisible ? "" : undefined,
    "data-state": isPressed ? "pressed" : isFocusVisible ? "focus-visible" : undefined
  } as const;

  const composedHandlers = {
    ...buttonProps,
    ...interactionHandlers
  };

  const anchorAccessibilityProps = href
    ? {
        href,
        "aria-disabled": disabled || loading ? true : undefined,
        tabIndex: interactionsDisabled ? -1 : undefined
      }
    : {};

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

  const baseProps = {
    ...domProps,
    ...composedHandlers,
    ...dataAttributes,
    className: mergedClassName,
    style: { ...baseStyle, ...variantStyle, ...focusRingStyle, ...style },
    "aria-busy": loading || undefined
  };

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
