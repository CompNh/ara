import type { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  readonly title?: string;
}

// 런타임 엔트리포인트 보존을 위해 더미 값을 export 합니다.
export const __ICON_TYPES__ = undefined;
