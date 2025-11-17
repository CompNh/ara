import { colors } from "../colors.js";

export type IconToneName = "primary" | "neutral" | "danger";
export type IconSizeName = "sm" | "md" | "lg";

export const icon = {
  size: {
    sm: "1rem",
    md: "1.25rem",
    lg: "1.5rem"
  },
  tone: {
    primary: colors.palette.brand["600"],
    neutral: colors.palette.neutral["700"],
    danger: colors.palette.danger["600"]
  },
  strokeWidth: {
    default: 2
  }
} as const;

export type IconTokens = typeof icon;
