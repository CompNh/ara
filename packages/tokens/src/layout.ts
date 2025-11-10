// 📐 프로젝트 전역 레이아웃 토큰 정의
export const layout = {
  // 공통 여백·간격 스케일 (px 단위)
  space: {
    none: "0px",
    "3xs": "2px",
    "2xs": "4px",
    xs: "8px",
    sm: "12px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "40px",
    "3xl": "48px"
  },

  // 모서리 곡률(radius) 스케일
  radius: {
    none: "0px",
    xs: "2px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    pill: "9999px"
  },

  // 그림자/고도(elevation) 스케일
  elevation: {
    none: "none",
    xs: "0 1px 2px 0 rgba(15, 23, 42, 0.08)",
    sm: "0 2px 4px -1px rgba(15, 23, 42, 0.1), 0 1px 2px rgba(15, 23, 42, 0.08)",
    md: "0 4px 6px -2px rgba(15, 23, 42, 0.12), 0 2px 4px -1px rgba(15, 23, 42, 0.1)",
    lg: "0 10px 15px -3px rgba(15, 23, 42, 0.14), 0 4px 6px -4px rgba(15, 23, 42, 0.12)",
    xl: "0 20px 25px -5px rgba(15, 23, 42, 0.16), 0 10px 10px -5px rgba(15, 23, 42, 0.12)"
  },

  // UI 레이어 우선순위(z-index)
  zIndex: {
    auto: "auto",
    hide: "-1",
    base: "0",
    dropdown: "1000",
    sticky: "1020",
    overlay: "1040",
    modal: "1060",
    popover: "1080",
    tooltip: "1100"
  }
} as const;

export type LayoutTokens = typeof layout;

export type LayoutCategory = keyof LayoutTokens;

export type LayoutScale<
  TCategory extends LayoutCategory = LayoutCategory
> = LayoutTokens[TCategory];

export type LayoutKey<
  TCategory extends LayoutCategory = LayoutCategory
> = keyof LayoutTokens[TCategory];

export function getLayoutValue<
  C extends LayoutCategory,
  K extends LayoutKey<C>
>(category: C, key: K): LayoutTokens[C][K] {
  return layout[category][key];
}
