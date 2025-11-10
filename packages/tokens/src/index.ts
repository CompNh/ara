import { colors } from "./colors.js";
import { button } from "./components/button.js";
import { layout } from "./layout.js";
import { typography } from "./typography.js";

export * from "./colors.js";
export * from "./typography.js";
export * from "./layout.js";
export * from "./components/button.js";
export * from "./css-vars.js";

export const tokens = {
  color: colors,
  layout,
  typography,
  component: {
    button
  }
} as const;

export type Tokens = typeof tokens;
