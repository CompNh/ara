import { colors } from "./colors.js";
import { typography } from "./typography.js";

export * from "./colors.js";
export * from "./typography.js";

export const tokens = {
  color: colors,
  typography
} as const;

export type Tokens = typeof tokens;
