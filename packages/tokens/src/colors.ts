export const colors = {
  brand: {
    "50": "#F5F9FF",
    "100": "#E0EDFF",
    "200": "#B8D5FF",
    "300": "#8AB6FF",
    "400": "#578DFF",
    "500": "#2F6BFF",
    "600": "#1F4FCC",
    "700": "#173CA3",
    "800": "#102A7A",
    "900": "#0A1C52"
  },
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
} as const;

export type ColorTokens = typeof colors;
export type ColorRampName = keyof ColorTokens;
export type ColorRamp<TName extends ColorRampName = ColorRampName> = ColorTokens[TName];
export type ColorShade<TName extends ColorRampName = ColorRampName> = keyof ColorTokens[TName] & string;

export function getColor<R extends ColorRampName, S extends ColorShade<R>>(
  ramp: R,
  shade: S
): ColorTokens[R][S] {
  return colors[ramp][shade];
}
