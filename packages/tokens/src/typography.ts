export const typography = {
  fontFamily: {
    sans: "'Pretendard Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.25rem",
    xl: "1.5rem"
  },
  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.75"
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    bold: 700
  },
  letterSpacing: {
    tighter: "-0.01em",
    normal: "0",
    wider: "0.05em"
  }
} as const;

export type TypographyTokens = typeof typography;
export type TypographyCategory = keyof TypographyTokens;
export type TypographyScale<
  TCategory extends TypographyCategory = TypographyCategory
> = TypographyTokens[TCategory];
export type TypographyKey<
  TCategory extends TypographyCategory = TypographyCategory
> = keyof TypographyTokens[TCategory];

export function getTypographyValue<
  C extends TypographyCategory,
  K extends TypographyKey<C>
>(category: C, key: K): TypographyTokens[C][K] {
  return typography[category][key];
}
