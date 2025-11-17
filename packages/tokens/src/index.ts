import { colors } from "./colors.js";
import { button } from "./components/button.js";
import { icon } from "./components/icon.js";
import { layout } from "./layout.js";
import { typography } from "./typography.js";

export * from "./colors.js";
export * from "./typography.js";
export * from "./layout.js";
export * from "./components/button.js";
export * from "./components/icon.js";
export * from "./css-vars.js";

export const tokens = {
  color: colors,
  layout,
  typography,
  component: {
    button,
    icon
  }
} as const;

export type Tokens = typeof tokens;
