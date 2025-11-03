// 🎨 프로젝트 전역 색상 팔레트 (디자인 토큰 기반)
export const colors = {
  // 브랜드 기본 색상 (주 브랜드 컬러 ramp)
  brand: {
    "50": "#F5F9FF",
    "100": "#E0EDFF",
    "200": "#B8D5FF",
    "300": "#8AB6FF",
    "400": "#578DFF",
    "500": "#2F6BFF", // 기본(Primary)
    "600": "#1F4FCC",
    "700": "#173CA3",
    "800": "#102A7A",
    "900": "#0A1C52"
  },
  // 중립(Neutral) 계열: 배경, 텍스트, 경계선 등
  neutral: {
    "50": "#F8FAFC",
    "100": "#EEF2F6",
    "200": "#E2E8F0",
    "300": "#CBD5E1",
    "400": "#94A3B8",
    "500": "#64748B",
    "600": "#475569",
    "700": "#334155",
    "800": "#1E293B",
    "900": "#0F172A"
  },
  // 포인트 색상(보조 강조용)
  accent: {
    "100": "#FDF4FF",
    "200": "#FAE8FF",
    "300": "#F5D0FE",
    "400": "#E879F9",
    "500": "#D946EF",
    "600": "#C026D3",
    "700": "#A21CAF",
    "800": "#86198F",
    "900": "#701A75"
  }
} as const; // as const로 리터럴 타입 고정 (불변)

// 색상 객체 전체 타입
export type ColorTokens = typeof colors;

// 색상 ramp 이름 (brand | neutral | accent)
export type ColorRampName = keyof ColorTokens;

// 특정 ramp의 색상 단계 타입 (예: brand["500"])
export type ColorRamp<TName extends ColorRampName = ColorRampName> = ColorTokens[TName];

// ramp 내 쉐이드 key 타입 (예: "50" | "100" | ... | "900")
export type ColorShade<TName extends ColorRampName = ColorRampName> =
  keyof ColorTokens[TName] & string;

// 특정 ramp와 shade를 받아 해당 hex 코드 반환
export function getColor<R extends ColorRampName, S extends ColorShade<R>>(
  ramp: R,
  shade: S
): ColorTokens[R][S] {
  return colors[ramp][shade];
  // 예: getColor("brand", "500") → "#2F6BFF"
}
