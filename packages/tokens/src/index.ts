import { colors } from "./colors.js";
import { button } from "./components/button.js";
import { formControl } from "./components/form-control.js";
import { icon } from "./components/icon.js";
import { textField } from "./components/text-field.js";
import { layout } from "./layout.js";
import { typography } from "./typography.js";

export * from "./colors.js";
export * from "./typography.js";
export * from "./layout.js";
export * from "./components/button.js";
export * from "./components/form-control.js";
export * from "./components/icon.js";
export * from "./components/text-field.js";
export * from "./css-vars.js";

export const tokens = {
  color: colors,
  layout,
  typography,
  component: {
    button,
    formControl,
    icon,
    textField
  }
} as const;

export type Tokens = typeof tokens;
