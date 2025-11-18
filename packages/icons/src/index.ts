export type { IconProps } from "./types.js";
export { __ICON_TYPES__ } from "./types.js";
import { ArrowRight } from "./icons/arrow-right.js";
import { CheckCircle } from "./icons/check-circle.js";
import { Plus } from "./icons/plus.js";
export { ArrowRight, CheckCircle, Plus };
export const icons = {
  ArrowRight,
  CheckCircle,
  Plus
} as const;
export type IconName = keyof typeof icons;
