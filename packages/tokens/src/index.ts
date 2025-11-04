import { colors } from "./colors.js";
import { button } from "./components/button.js";
import { typography } from "./typography.js";

export * from "./colors.js";
export * from "./typography.js";
export * from "./components/button.js";

export const tokens = {
  color: colors,
  typography,
  component: {
    button
  }
} as const;

export type Tokens = typeof tokens;
