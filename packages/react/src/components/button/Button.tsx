import { forwardRef, type ButtonHTMLAttributes, type CSSProperties } from "react";
import { useAraTheme } from "../../theme/index.js";
import type { Theme } from "@ara/core";

export type ButtonVariant = "primary" | "secondary";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
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

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, variant = "primary", style, type = "button", disabled, ...rest },
  ref
) {
  const theme = useAraTheme();

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
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition: "background-color 150ms ease, color 150ms ease, border-color 150ms ease",
    textDecoration: "none"
  };

  const variantStyle = getVariantStyle(variant, theme);

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      disabled={disabled}
      data-ara-variant={variant}
      style={{ ...baseStyle, ...variantStyle, ...style }}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";
