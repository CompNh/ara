export type { IconProps } from "./types.js";
export { __ICON_TYPES__ } from "./types.js";
import { ArrowRight } from "./icons/arrow-right.js";
import { Close } from "./icons/close.js";
import { CheckCircle } from "./icons/check-circle.js";
import { Eye } from "./icons/eye.js";
import { Plus } from "./icons/plus.js";
import { Search } from "./icons/search.js";
export { ArrowRight, CheckCircle, Close, Eye, Plus, Search };
export const icons = {
  ArrowRight,
  CheckCircle,
  Close,
  Eye,
  Plus,
  Search
} as const;
export type IconName = keyof typeof icons;
