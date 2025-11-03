import {
  forwardRef,
  isValidElement,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type PointerEventHandler
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
  theirs: ((event: Event) => void) | undefined
): ((event: Event) => void) | undefined {
  if (!ours && !theirs) {
    return undefined;
  }

  return (event: Event) => {
    ours?.(event);
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
    ...domProps
  } = restProps as ButtonEventHandlers & Omit<typeof restProps, keyof ButtonEventHandlers>;

  const interactionHandlers: ButtonEventHandlers = {
    onClick: composeEventHandlers(buttonProps.onClick, onClick),
    onKeyDown: composeEventHandlers(buttonProps.onKeyDown, onKeyDown),
    onKeyUp: composeEventHandlers(buttonProps.onKeyUp, onKeyUp),
    onPointerDown: composeEventHandlers(buttonProps.onPointerDown, onPointerDown),
    onPointerUp: composeEventHandlers(buttonProps.onPointerUp, onPointerUp),
    onPointerCancel: composeEventHandlers(buttonProps.onPointerCancel, onPointerCancel),
    onPointerLeave: composeEventHandlers(buttonProps.onPointerLeave, onPointerLeave)
  };

  const Component = asChild && isValidElement(children) ? Slot : href ? "a" : "button";
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
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition: "background-color 150ms ease, color 150ms ease, border-color 150ms ease",
    textDecoration: "none"
  };

  const variantStyle = getVariantStyle(variant, theme);

  const dataAttributes = {
    "data-variant": variant,
    "data-disabled": disabled ? "" : undefined,
    "data-loading": loading ? "" : undefined,
    "data-state": isPressed ? "pressed" : undefined
  } as const;

  const elementSpecificProps =
    elementType === "button"
      ? { type, disabled: disabled || loading, "aria-busy": loading || undefined }
      : {
          href,
          "aria-disabled": disabled || loading ? true : undefined,
          "aria-busy": loading || undefined
        };

  const componentProps = {
    ...domProps,
    ...interactionHandlers,
    ...dataAttributes,
    className: mergedClassName,
    style: { ...baseStyle, ...variantStyle, ...style },
    ref,
    ...elementSpecificProps
  };

  return (
    <Component {...componentProps}>
      {children}
    </Component>
  );
});

Button.displayName = "Button";
